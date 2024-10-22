import logger from '@adonisjs/core/services/logger'
import * as fs from 'node:fs'
import { chromium } from 'playwright'
import encryption from '@adonisjs/core/services/encryption'
import { spawn } from 'node:child_process'
import pidusage from 'pidusage'
import si from 'systeminformation'
import transmit from "@adonisjs/transmit/services/main";
import redis from "@adonisjs/redis/services/main";
import {Readable} from "node:stream";

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
  private screenshotStream: Readable;


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

  async startStream() {
    console.log('Starting stream...');

    // Créez le flux de captures d'écran
    this.screenshotStream = new Readable({
      read() {
        // L'implémentation est vide car nous pousserons les données manuellement
      },
    });

    if (this.enableBrowser) {
      console.log('Browser capture enabled.');
      this.startBrowserCapture().catch((error) => {
        logger.error('Failed to start browser capture:', error.message);
      });
    }

    const inputParameters = [
      '-re',
      '-f', 'image2pipe',
      '-vcodec', 'png',
      '-r', this.fps.toString(),
      '-i', 'pipe:0',
      '-protocol_whitelist', 'file,concat,http,https,tcp,tls,crypto',
      '-safe', '0',
      '-f', 'concat',
      '-i', this.timelinePath,
    ];

    if (this.loop) {
      inputParameters.push('-stream_loop', '-1');
    }

    let filterComplex = '';

    // Construisez le filter_complex en fonction des entrées
    if (this.enableBrowser && this.showWatermark) {
      filterComplex = `
        [1:v]scale=640:480[overlay];
        [0:v][overlay]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2[watermarked];
        [watermarked][2:v]overlay=10:10[final];
      `;
    } else if (this.enableBrowser) {
      filterComplex = `
        [1:v]scale=640:480[overlay];
        [0:v][overlay]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2[final];
      `;
    } else if (this.showWatermark) {
      filterComplex = `
        [0:v][1:v]overlay=10:10[final];
      `;
    } else {
      filterComplex = `
        [0:v]scale=${this.resolution}[final];
      `;
    }

    const encodingParameters = [
      '-filter_complex', filterComplex.trim(),
      '-map', '[final]',
      '-map', '0:a?',
      '-s', this.resolution,
      '-c:a', 'aac',
      '-c:v', 'h264_rkmpp',
      '-preset', 'veryfast',
      '-b:v', this.bitrate,
      '-maxrate', this.bitrate,
      '-bufsize', `${Number.parseInt(this.bitrate) * 2}k`,
      '-flags', 'low_delay',
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

    this.isStopping = false;
    this.startTimeTracking();

    // Démarrer le processus FFmpeg
    this.instance = spawn('ffmpeg', [...inputParameters, ...encodingParameters], {
      detached: true,
      stdio: ['pipe', 'inherit', 'inherit'],
    });

    // Pipeliner le flux de captures d'écran vers stdin de FFmpeg
    this.screenshotStream.pipe(this.instance.stdin);

    this.instance.on('exit', (code) => {
      if (code !== 0 && !this.isStopping) {
        console.log('FFmpeg exited unexpectedly. Attempting to restart...');
        setTimeout(() => this.startStream(), RESTART_DELAY_MS);
      }
    });

    const pid = this.instance.pid;
    console.log(`Stream ${this.streamId} started with PID ${pid}`);
    // Enregistrez le PID si nécessaire
  }
  private async startBrowserCapture() {
    (async () => {
      const browser = await chromium.launch({
        args: [
          '--window-size=640,480',
          '--window-position=640,0',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-software-rasterizer',
          '--disable-dev-shm-usage',
          '--use-gl=swiftshader',
          '--disable-web-security',
          '--disable-features=VaapiVideoDecoder,WebRTC',
        ],
        ignoreDefaultArgs: ['--disable-dev-shm-usage'],
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
      });

      const page = await browser.newPage();
      await page.goto(this.webpageUrl, { waitUntil: 'load', timeout: 10000 });
      logger.info(`Browser navigated to ${this.webpageUrl} successfully.`);
      /*await page.evaluate(() => {
        document.body.style.background = 'transparent';
      });*/

      this.captureAndStreamScreenshots(page).catch((error) => {
        logger.error('Error in capture process:', error.message);
      });
    })().catch((error) => {
      logger.error('Failed to start browser capture:', error.message);
    });
  }

  private async captureAndStreamScreenshots(page: any) {
    try {
      while (this.enableBrowser) {
        const screenshotBuffer = await page.screenshot({ type: 'png', omitBackground: true });
        // Pousser le buffer dans le flux
        this.screenshotStream.push(screenshotBuffer);
        await new Promise((resolve) => setTimeout(resolve, 1000 / this.fps));
      }
    } catch (error) {
      logger.error('Error capturing screenshot:', error.message);
      this.enableBrowser = false;
    } finally {
      // Terminer le flux
      this.screenshotStream.push(null);
      await page.close();
      await page.context().browser().close();
    }
  }

  private async captureAudioVideo(page: any, fifoPath: string) {
    let writeStream;
    try {
      writeStream = fs.createWriteStream(fifoPath, { flags: 'a' });

      writeStream.on('error', (error) => {
        this.enableBrowser = false;
      });

      while (this.enableBrowser) {
        try {
          const screenshot = await page.screenshot({ type: 'jpeg', quality: 30 });
          if (writeStream.writable) {
            writeStream.write(screenshot);
          } else {
            logger.error('Write stream is not writable.');
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000 / 30));
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
