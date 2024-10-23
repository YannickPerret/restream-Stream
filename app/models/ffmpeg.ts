import logger from '@adonisjs/core/services/logger'
import * as fs from 'node:fs'
import { chromium } from 'playwright-core'
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
    console.log('Starting stream...')

    // Supprimer le FIFO existant s'il existe
    if (fs.existsSync(FIFO_PATH)) {
      fs.unlinkSync(FIFO_PATH)
    }

    // Créer le FIFO seulement si le navigateur est activé
    if (this.enableBrowser) {
      try {
        execSync(`mkfifo ${FIFO_PATH}`)
      } catch (error) {
        console.error('Failed to create FIFO:', error)
        throw error
      }

      console.log('Browser capture enabled.')
      this.startBrowserCapture().catch((error) => {
        logger.error('Failed to start browser capture:', error.message)
      })

      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    const inputParameters = [
      '-re',
      '-hwaccel', 'rkmpp',
      '-probesize', '10M',
      '-analyzeduration','10M',
    ]

    inputParameters.push(
      '-stream_loop', this.loop ? '-1' : '0',
      '-protocol_whitelist',
      'file,concat,http,https,tcp,tls,crypto',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      this.timelinePath,
      '-r',
      this.fps.toString(),
    )


    if (this.enableBrowser) {
      inputParameters.push(
        '-f', 'png_pipe',
        '-thread_queue_size', '1024',
        '-i', FIFO_PATH,
      )
    }

    if (this.showWatermark) {
      inputParameters.push('-i', app.publicPath('watermark/watermark.png'))
    }
    let filterComplex: string[] = [];

    if (this.showWatermark) {
      const logoScale = 'scale=200:-1';
      const logoPosition = '(main_w-overlay_w)/2:10';

      if (this.enableBrowser) {
        // Handle browser overlay + watermark
        filterComplex.push(
          `[0:v]scale=${this.resolution}[main];` +
          `[1:v]${logoScale}[logo];` +
          `[main][logo]overlay=${logoPosition}[watermarked];` +
          `[watermarked][2:v]overlay=0:0[composite];` +
          `[composite]fps=fps=${this.fps}[vout]`
        );
      } else {
        // Handle only watermark
        filterComplex.push(
          `[1:v]${logoScale}[logo];` +
          `[0:v][logo]overlay=${logoPosition}[vout]`
        );
      }
    } else {
      if (this.enableBrowser) {
        // Handle only browser overlay
        filterComplex.push(
          `[0:v]scale=${this.resolution}[main];` +
          `[main][1:v]overlay=0:0[composite];` +
          `[composite]fps=fps=${this.fps}[vout]`
        );
      } else {
        // No watermark or browser overlay, just the main video
        filterComplex.push(`[0:v]fps=fps=${this.fps}[vout]`);
      }
    }


    const encodingParameters = [
      '-filter_complex',
      filterComplex.join(''),
      '-map',
      '[vout]',
      '-map',
      '0:a?',
      '-s',
      this.resolution,
      '-c:a',
      'aac',
      '-c:v',
      'h264_rkmpp',
      '-rc_mode',
      'CBR',
      '-b:v',
      this.bitrate,
      '-maxrate',
      this.bitrate,
      '-bufsize',
      `${Number.parseInt(this.bitrate) * 2}k`,
      '-flags',
      'low_delay',
      '-pix_fmt',
      'yuv420p',
    ];

    // Gérer la sortie pour un ou plusieurs canaux
    if (this.channels.length === 1) {
      const channel = this.channels[0]
      const baseUrl = BASE_URLS[channel.type]
      const outputUrl = `${baseUrl}/${encryption.decrypt(channel.streamKey)}`
      encodingParameters.push('-f', 'flv', outputUrl)
    } else {
      const teeOutput = this.channels
        .map((channel) => {
          const baseUrl = BASE_URLS[channel.type]
          const outputUrl = `${baseUrl}/${encryption.decrypt(channel.streamKey)}`
          return `[f=flv]${outputUrl}`
        })
        .join('|')
      encodingParameters.push('-f', 'tee', teeOutput)
    }

    this.isStopping = false
    this.startTimeTracking()

    // Démarrer le processus FFmpeg
    console.log([...inputParameters, ...encodingParameters])
    this.instance = spawn('ffmpeg', [...inputParameters, ...encodingParameters], {
      detached: true,
      stdio: ['ignore', 'inherit', 'inherit'],
    })

    this.instance.on('error', (error) => {
      console.error(`FFmpeg process error: ${error.message}`)
    })

    this.instance.on('close', (code, signal) => {
      console.log(`FFmpeg process closed with code ${code} and signal ${signal}`)
    })

    this.instance.on('exit', (code) => {
      console.log(`FFmpeg process exited with code ${code}`)
      if (code !== 0 && !this.isStopping) {
        console.log('FFmpeg exited unexpectedly. Stopping retry due to explicit stop request.');
        this.isStopping = true; // Prevent further restart attempts
      }
    })

    const pid = this.instance.pid
    console.log(`FFmpeg process started with PID ${pid}`)
    await redis.set(`stream:${this.streamId}:pid`, pid.toString());
    console.log(`Stream ${this.streamId} started with PID ${pid}`)
  }

  private async startBrowserCapture() {
    const browser = await chromium.launch({
      args: [
        '--disable-gpu', // Disable GPU hardware acceleration
        '--no-sandbox', // Disable sandbox for performance
        '--disable-setuid-sandbox', // Disable setuid sandbox
        '--disable-accelerated-2d-canvas', // Disable 2D canvas acceleration
        '--disable-web-security', // Disable web security (CORS-related issues)
        '--disable-extensions', // Disable all browser extensions
        '--disable-background-networking', // Reduce background networking
        '--disable-background-timer-throttling', // Prevent throttling of background timers
        '--disable-backgrounding-occluded-windows', // Disable backgrounding of occluded windows
        '--disable-renderer-backgrounding', // Prevent renderer from being backgrounded
        '--disable-sync', // Disable syncing to cloud services
        '--disable-default-apps', // Disable default apps
        '--disable-translate', // Disable translation services
        '--disable-dev-shm-usage', // Disable /dev/shm usage (avoid memory issues in Docker)
        '--mute-audio', // Mute audio to save resources
        '--no-first-run', // Skip the first run tasks
        '--disable-software-rasterizer', // Disable software rasterizer
        '--disable-features=site-per-process', // Disable site isolation (reduces memory usage)
        '--disable-features=IsolateOrigins,site-per-process', // Further disable features
        '--disable-notifications', // Disable web notifications
        '--incognito', // Use incognito mode for reduced memory footprint
        '--disable-popup-blocking', // Disable popup blocking
        '--disable-infobars', // Disable infobars (e.g., Chrome is being controlled by automated software)
        '--ignore-certificate-errors', // Ignore SSL certificate errors
      ],
      headless: true,
    });

    const [width, height] = this.resolution.split('x').map(Number);

    const page = await browser.newPage({
      viewport: { width, height },
    });

    try {
      await page.goto(this.webpageUrl, { waitUntil: 'load', timeout: 7000 });
      logger.info(`Browser navigated to ${this.webpageUrl} successfully.`);
    } catch (error) {
      logger.error(`Failed to load webpage: ${error.message}`);
      await browser.close();
      return;
    }

    // Open the FIFO for writing
    this.fifoWriteStream = fs.createWriteStream(FIFO_PATH);

    this.captureAndStreamScreenshots(page).catch((error) => {
      logger.error('Error in capture process:', error.message);
    });
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

        // Log after the delay
        await new Promise((resolve) => setTimeout(resolve, 1000 / 14));
        logger.info('Screenshot capture cycle completed.');
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
