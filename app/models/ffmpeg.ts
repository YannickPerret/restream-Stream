import logger from '@adonisjs/core/services/logger'
import * as fs from 'node:fs'
import { chromium } from 'playwright'
import encryption from '@adonisjs/core/services/encryption'
import { spawn } from 'node:child_process'
import pidusage from 'pidusage'
import si from 'systeminformation'
import transmit from "@adonisjs/transmit/services/main";
import app from "@adonisjs/core/services/app";
import redis from "@adonisjs/redis/services/main";

const SCREENSHOT_FIFO = '/tmp/screenshot_fifo'
const OUTPUT_FIFO = '/tmp/puppeteer_stream'
const RESTART_DELAY_MS = 10000;

const BASE_URLS: Record<string, string> = {
  twitch: 'rtmp://live.twitch.tv/app',
  youtube: 'rtmp://a.rtmp.youtube.com/live2',
}

export default class FFMPEGStream {
  private instance: any
  private analyticsInterval: NodeJS.Timeout | null = null
  private timeTrackingInterval: NodeJS.Timeout | null = null;
  private elapsedTime: number = 0;
  private isStopping: boolean = false;

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
    private showWatermark: boolean,
  ) {}

  async startStream(p0: (bitrate: any) => void) {
    console.log('Starting stream...');
    if (this.enableBrowser) {
      console.log('Browser capture enabled.');
      await this.createFifos();
      if (!this.checkFifos()) {
        console.error('Cannot start stream. FIFOs are not ready.');
        return;
      }

      // Lance la capture du navigateur sans bloquer la suite du code
      this.startBrowserCapture();
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const inputParameters = [
      '-re',
      '-hwaccel',
      'rkmpp',
      '-protocol_whitelist',
      'file,concat,http,https,tcp,tls,crypto',
    ];

    console.log('FFmpeg input parameters:', inputParameters);

    const savedElapsedTime = await redis.get(`stream:${this.streamId}:elapsed_time`);
    if (savedElapsedTime) {
      const resumeTimeInSeconds = parseInt(savedElapsedTime, 10);
      const hours = Math.floor(resumeTimeInSeconds / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((resumeTimeInSeconds % 3600) / 60).toString().padStart(2, '0');
      const seconds = (resumeTimeInSeconds % 60).toString().padStart(2, '0');
      const resumeTime = `${hours}:${minutes}:${seconds}`;
      inputParameters.push('-ss', resumeTime);
    }

    if (this.loop) {
      inputParameters.push('-stream_loop', '-1')
    }
    inputParameters.push(
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      `concat:${this.timelinePath}`,
      '-r',
      this.fps.toString()
    )

    if (this.showWatermark) {
      inputParameters.push('-i', app.publicPath('watermark/watermark.png'))
    }

    let filterComplex: string[] = []

    if (this.enableBrowser) {
      inputParameters.push('-i', SCREENSHOT_FIFO);
      //inputParameters.push('-i', SCREENSHOT_FIFO + '_2');
    }

    if (this.showWatermark) {
      const logoScale = 'scale=200:-1'
      const logoPosition = '(main_w-overlay_w)/2:10'

      if (this.enableBrowser) {
        filterComplex.push(
          `[0:v][1:v]overlay=(main_w-overlay_w)/2:10[watermarked];`,
          `[watermarked][2:v][3:v]overlay=0:0,fps=fps=${this.fps}[vout]`
        );
      } else {
        filterComplex.push(`[1:v]${logoScale}[logo];`, `[0:v][logo]overlay=${logoPosition}[vout]`)
      }
    } else {
      if (this.enableBrowser) {
        filterComplex.push(`[0:v][1:v]overlay=0:0,fps=fps=${this.fps}[vout]`)
      } else {
        filterComplex.push(`[0:v]fps=fps=${this.fps}[vout]`)
      }
    }

    const encodingParameters = [
      '-filter_complex',
      filterComplex.join(''),
      '-map',
      '[vout]',
      '-map',
      '0:a?',
      //'-map',
      //'1:a?',
      '-s',
      this.resolution,
      '-c:a',
      'aac',
      '-c:v',
      'h264_rkmpp',
      '-b:v',
      this.bitrate,
      '-maxrate',
      this.bitrate,
      '-bufsize',
      `${Number.parseInt(this.bitrate) * 2}k`,
      '-flags',
      'low_delay',
    ]

    // Gestion de la sortie pour un ou plusieurs canaux
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

    this.startTimeTracking();
    this.isStopping = false;

    this.instance = spawn('ffmpeg', [...inputParameters, ...encodingParameters], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    this.instance.stdout.on('data', (data) => {
      console.log(`FFmpeg stdout: ${data}`)
    })

    this.instance.stderr.on('data', (data) => {
      logger.info(data.toString())
    })

    this.instance.on('exit', async (code) => {
      if (code !== 0 && !this.isStopping) {
        console.log(`Stream exited unexpectedly. Attempting to restart in ${RESTART_DELAY_MS / 1000} seconds...`);
        setTimeout(() => this.startStream(), RESTART_DELAY_MS);
      }
    });

    return Number.parseInt(this.instance.pid.toString(), 10)
  }

  private async startBrowserCapture() {
    (async () => {
      const browser = await chromium.launch({
        args: [
          '--disable-gpu',
          '--no-sandbox',
          '--disable-software-rasterizer',
          '--disable-dev-shm-usage',
          '--use-gl=swiftshader',
          '--disable-web-security',
          '--disable-features=VaapiVideoDecoder,WebRTC',
        ],
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
      });

      const page = await browser.newPage();

      await page.goto(this.webpageUrl, { waitUntil: 'load', timeout: 10000 });
      logger.info(`Browser navigated to ${this.webpageUrl} successfully.`);

      // Capture les screenshots de manière asynchrone
      this.captureAudioVideo(page, SCREENSHOT_FIFO).catch((error) => {
        logger.error('Error in capture process:', error.message);
      });
    })().catch((error) => {
      logger.error('Failed to start browser capture:', error.message);
    });
  }

  private async captureAudioVideo(page: any, fifoPath: string) {
    let writeStream;
    try {
      writeStream = fs.createWriteStream(fifoPath, { flags: 'a' });

      writeStream.on('error', (error) => {
        logger.error('Write stream error:', error.message);
        this.enableBrowser = false;
      });

      while (this.enableBrowser) {
        try {
          const screenshot = await page.screenshot({ type: 'jpeg', quality: 50 });
          if (writeStream.writable) {
            writeStream.write(screenshot);
          } else {
            logger.error('Write stream is not writable.');
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000 / 60)); // 60 fps
        } catch (error) {
          logger.error('Error capturing screenshot or writing to FIFO:', error.message);
          this.enableBrowser = false;
          break;
        }
      }
    } catch (error) {
      logger.error('Error initializing write stream:', error.message);
    } finally {
      if (writeStream) {
        writeStream.end();
      }
      await page.close();
      await page.context().browser().close();
    }
  }


  private async createFifos() {
    const fifoPaths = [SCREENSHOT_FIFO, OUTPUT_FIFO];
    for (const fifo of fifoPaths) {
      try {
        if (fs.existsSync(fifo)) {
          fs.unlinkSync(fifo); // Supprime l'ancien FIFO s'il existe
          console.log(`Existing FIFO ${fifo} removed.`);
        }
        await new Promise((resolve, reject) => {
          spawn('mkfifo', [fifo]).on('close', (code) => {
            if (code === 0) {
              console.log(`FIFO ${fifo} created successfully.`);
              resolve(true);
            } else {
              reject(`Failed to create FIFO ${fifo} with exit code ${code}.`);
            }
          });
        });
      } catch (error) {
        console.error(`Failed to create FIFO ${fifo}:`, error.message);
      }
    }
  }

  private removeFifos() {
    ;[SCREENSHOT_FIFO, OUTPUT_FIFO].forEach((fifo) => {
      try {
        if (fs.existsSync(fifo)) {
          fs.unlinkSync(fifo)
          console.log(`FIFO ${fifo} removed successfully.`)
        }
      } catch (error) {
        console.error(`Failed to remove FIFO ${fifo}:`, error.message)
      }
    })
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

  stopStream = async (pid: number) => {
    this.isStopping = true;
    if (this.instance) {
      process.kill(pid, 'SIGKILL');
      this.removeFifos();
    }
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
    }

    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval);
    }

    if (this.timeTrackingInterval) {
      clearInterval(this.timeTrackingInterval);
    }

    await redis.del(`stream:${this.streamId}:elapsed_time`);
  }

  private startTimeTracking() {
    this.elapsedTime = 0;

    this.timeTrackingInterval = setInterval(async () => {
      this.elapsedTime += 10;
      await redis.set(`stream:${this.streamId}:elapsed_time`, this.elapsedTime.toString());
    }, 10000);
  }

  private checkFifos(): boolean {
    const fifoPaths = [SCREENSHOT_FIFO, OUTPUT_FIFO];
    for (const fifo of fifoPaths) {
      if (!fs.existsSync(fifo)) {
        logger.error(`FIFO ${fifo} does not exist.`);
        return false;
      }
      try {
        fs.accessSync(fifo, fs.constants.W_OK | fs.constants.R_OK);
      } catch (err) {
        logger.error(`No read/write access to FIFO ${fifo}: ${err.message}`);
        return false;
      }
    }
    return true;
  }

}
