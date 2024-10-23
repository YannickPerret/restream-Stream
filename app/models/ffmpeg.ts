import logger from '@adonisjs/core/services/logger'
import * as fs from 'node:fs'
import { chromium, webkit } from 'playwright-core'
import encryption from '@adonisjs/core/services/encryption'
import { spawn, execSync } from 'node:child_process'
import pidusage from 'pidusage'
import si from 'systeminformation'
import transmit from '@adonisjs/transmit/services/main'
import redis from '@adonisjs/redis/services/main'
import app from '@adonisjs/core/services/app'
import sharp from "sharp";

const FIFO_PATH = '/tmp/ffmpeg_fifo'
const RESTART_DELAY_MS = 10000
const SCREENSHOT_VIDEO = '/tmp/ffmpeg_screenshot_output.flv';

const BASE_URLS: Record<string, string> = {
  twitch: 'rtmp://live.twitch.tv/app',
  youtube: 'rtmp://a.rtmp.youtube.com/live2',
}

export default class FFMPEGStream {
  private instance: any
  private analyticsInterval: NodeJS.Timeout | null = null
  private timeTrackingInterval: NodeJS.Timeout | null = null
  private elapsedTime: number = 0
  private isStopping: boolean = false
  private fifoWriteStream: fs.WriteStream

  constructor(
    private streamId: string,
    private channels: { type: string; streamKey: string }[],
    private timelinePath: string,
    private logo: string,
    private overlay: string,
    private guestFile: string,
    private enableBrowser: boolean,
    private webpageUrl: string,
    private bitrate: string,
    private resolution: string,
    private fps: number,
    private loop: boolean,
    private showWatermark: boolean
  ) {}

  async startStream() {
    console.log('Starting stream...');

    // Supprimer le FIFO existant s'il existe
    if (fs.existsSync(FIFO_PATH)) {
      fs.unlinkSync(FIFO_PATH);
    }

    // Créer le FIFO pour les screenshots
    execSync(`mkfifo ${FIFO_PATH}`);

    // Lancer le processus FFmpeg pour les screenshots
    spawn('ffmpeg', [
      '-f', 'image2pipe',
      '-framerate', '15',
      '-i', FIFO_PATH,
      '-c:v', 'h264_rkmpp',
      '-pix_fmt', 'yuv420p',
      '-f', 'flv',
      SCREENSHOT_VIDEO
    ], {
      detached: true,
      stdio: ['ignore', 'inherit', 'inherit'],
    });

    if (this.enableBrowser) {
      this.startBrowserCapture().catch((error) => {
        logger.error('Failed to start browser capture:', error.message);
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const inputParameters = [
      '-re',
      '-hwaccel', 'rkmpp',
      '-probesize', '10M',
      '-analyzeduration', '10M',
      '-stream_loop', this.loop ? '-1' : '0',
      '-protocol_whitelist', 'file,concat,http,https,tcp,tls,crypto',
      '-f', 'concat',
      '-safe', '0',
      '-i', this.timelinePath,
      '-r', this.fps.toString(),
    ];

    if (this.enableBrowser) {
      inputParameters.push(
        '-f', 'flv',
        '-i', SCREENSHOT_VIDEO // Use the video stream generated from screenshots
      );
    }

    if (this.showWatermark) {
      inputParameters.push('-i', app.publicPath('watermark/watermark.png'));
    }

    let filterComplex: string[] = [];

    if (this.showWatermark) {
      const logoScale = 'scale=200:-1';
      const logoPosition = '(main_w-overlay_w)/2:10';

      if (this.enableBrowser) {
        filterComplex.push(
          `[0:v]scale=${this.resolution}[main];` +
          `[1:v]${logoScale}[logo];` +
          `[main][logo]overlay=${logoPosition}[watermarked];` +
          `[watermarked][2:v]overlay=0:0[composite];` +
          `[composite]fps=fps=${this.fps}[vout]`
        );
      } else {
        filterComplex.push(
          `[1:v]${logoScale}[logo];` +
          `[0:v][logo]overlay=${logoPosition}[vout]`
        );
      }
    } else {
      if (this.enableBrowser) {
        filterComplex.push(
          `[0:v]scale=${this.resolution}[main];` +
          `[main][1:v]overlay=0:0[composite];` +
          `[composite]fps=fps=${this.fps}[vout]`
        );
      } else {
        filterComplex.push(`[0:v]fps=fps=${this.fps}[vout]`);
      }
    }

    const encodingParameters = [
      '-filter_complex', filterComplex.join(''),
      '-map', '[vout]',
      '-map', '0:a?',
      '-s', this.resolution,
      '-c:a', 'aac',
      '-c:v', 'h264_rkmpp',
      '-rc_mode', 'CBR',
      '-b:v', this.bitrate,
      '-maxrate', this.bitrate,
      '-bufsize', `${Number.parseInt(this.bitrate) * 2}k`,
      '-flags', 'low_delay',
      '-pix_fmt', 'yuv420p',
    ];

    if (this.channels.length === 1) {
      const channel = this.channels[0];
      const baseUrl = BASE_URLS[channel.type];
      const outputUrl = `${baseUrl}/${encryption.decrypt(channel.streamKey)}`;
      encodingParameters.push('-f', 'flv', outputUrl);
    } else {
      const teeOutput = this.channels
        .map((channel) => {
          const baseUrl = BASE_URLS[channel.type];
          const outputUrl = `${baseUrl}/${encryption.decrypt(channel.streamKey)}`;
          return `[f=flv]${outputUrl}`;
        })
        .join('|');
      encodingParameters.push('-f', 'tee', teeOutput);
    }

    this.isStopping = false;

    // Démarrer le processus principal FFmpeg
    console.log([...inputParameters, ...encodingParameters]);
    this.instance = spawn('ffmpeg', [...inputParameters, ...encodingParameters], {
      detached: true,
      stdio: ['ignore', 'inherit', 'inherit'],
    });

    this.instance.on('error', (error) => {
      console.error(`FFmpeg process error: ${error.message}`);
    });

    this.instance.on('close', (code, signal) => {
      console.log(`FFmpeg process closed with code ${code} and signal ${signal}`);
    });

    this.instance.on('exit', (code) => {
      console.log(`FFmpeg process exited with code ${code}`);
      if (code !== 0 && !this.isStopping) {
        console.log('FFmpeg exited unexpectedly.');
        this.isStopping = true;
      }
    });

    const pid = this.instance.pid;
    console.log(`FFmpeg process started with PID ${pid}`);
    await redis.set(`stream:${this.streamId}:pid`, pid.toString());
    console.log(`Stream ${this.streamId} started with PID ${pid}`);
  }

  private async startBrowserCapture() {
    const browser = await webkit.launch({
      args: [
        '--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox',
        '--disable-accelerated-2d-canvas', '--disable-web-security',
        '--disable-extensions', '--disable-background-networking',
        '--disable-background-timer-throttling', '--mute-audio',
      ],
      headless: true,
    });

    const [width, height] = this.resolution.split('x').map(Number);
    const page = await browser.newPage({ viewport: { width, height } });

    await page.goto(this.webpageUrl, { waitUntil: 'networkidle', timeout: 10000 });
    logger.info(`Browser navigated to ${this.webpageUrl} successfully.`);

    const screenshotFifo = fs.createWriteStream(FIFO_PATH);
    while (this.enableBrowser) {
      const screenshotBuffer = await page.screenshot({ type: 'png', omitBackground: true });
      const compressedBuffer = await sharp(screenshotBuffer)
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();
      screenshotFifo.write(compressedBuffer);
      await new Promise((resolve) => setTimeout(resolve, 1000 / 15));
    }
    await screenshotFifo.close();
    await page.close();
    await browser.close();
  }

  private async captureAndStreamScreenshots(page: any) {
    try {
      while (this.enableBrowser) {
        const screenshotBuffer = await page.screenshot({
          type: 'png',
          omitBackground: true,
        });

        // Compress the PNG using sharp
        const compressedBuffer = await sharp(screenshotBuffer)
          .png({ compressionLevel: 7, adaptiveFiltering: true })
          .toBuffer();

        // Check if FIFO stream is open before writing
        if (this.fifoWriteStream && this.fifoWriteStream.writable) {
          this.fifoWriteStream.write(compressedBuffer);
        } else {
          logger.error('FIFO write stream is not writable. Skipping this capture.');
          break; // Stop capturing if FIFO is not working
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 / 14));
      }
    } catch (error) {
      logger.error('Error capturing or compressing screenshot:', error.message);
      this.enableBrowser = false;
    } finally {
      // Close FIFO and clean up
      if (this.fifoWriteStream) {
        this.fifoWriteStream.end();
        logger.info('Closed FIFO write stream.');
      }
      await page.close();
      logger.info('Closed browser page.');
      await page.context().browser().close();
      logger.info('Closed browser context.');
    }
  }

  stopStream = async (pid: number) => {
    this.isStopping = true
    if (this.instance) {
      try {
        process.kill(pid, 'SIGKILL')
        console.log(`Stream with PID ${pid} successfully stopped.`)
      } catch (error) {
        if (error.code === 'ESRCH') {
          console.error(`No process found with PID ${pid}.`)
        } else {
          console.error(`Error stopping process with PID ${pid}: ${error.message}`)
        }
      }
    }
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval)
    }
    if (this.timeTrackingInterval) {
      clearInterval(this.timeTrackingInterval)
    }
    await redis.del(`stream:${this.streamId}:elapsed_time`)
    await redis.del(`stream:${this.streamId}:pid`);

    // Supprimer le FIFO s'il existe
    if (fs.existsSync(FIFO_PATH)) {
      fs.unlinkSync(FIFO_PATH)
    }
  }

  private startTimeTracking() {
    this.elapsedTime = 0

    this.timeTrackingInterval = setInterval(async () => {
      this.elapsedTime += 10
      await redis.set(`stream:${this.streamId}:elapsed_time`, this.elapsedTime.toString())
    }, 10000)
  }

  sendAnalytics = async (streamId: string, pid: number) => {
    this.analyticsInterval = setInterval(async () => {
      try {
        const stats = await pidusage(pid);
        const networkStats = await si.networkStats();

        const inputBytes = networkStats[0]?.rx_bytes || 0; // Octets reçus
        const outputBytes = networkStats[0]?.tx_bytes || 0; // Octets envoyés

        // Conversion des octets en Mbps
        const inputMbps = (inputBytes * 8) / 1000000; // en Mbps
        const outputMbps = (outputBytes * 8) / 1000000; // en Mbps

        const analyticsData = {
          cpu: stats.cpu,
          memory: stats.memory / 1024 / 1024,
          bitrate: this.bitrate,
          network: {
            input: inputMbps,
            output: outputMbps,
          },
        };

        transmit.broadcast(`streams/${streamId}/analytics`, { stats: analyticsData })
      } catch (err) {
        console.error(`Failed to send analytics for stream ${streamId}:`, err);
        clearInterval(this.analyticsInterval!);
      }
    }, 8000);
  }
}
