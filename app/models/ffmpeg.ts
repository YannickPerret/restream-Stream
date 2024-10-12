import logger from '@adonisjs/core/services/logger'
import * as fs from 'node:fs'
import puppeteer from 'puppeteer'
import encryption from '@adonisjs/core/services/encryption'
import { spawn } from 'node:child_process'

const SCREENSHOT_FIFO = '/tmp/screenshot_fifo'
const OUTPUT_FIFO = '/tmp/puppeteer_stream'

const BASE_URLS: Record<string, string> = {
  twitch: 'rtmp://live.twitch.tv/app',
  youtube: 'rtmp://a.rtmp.youtube.com/live2',
}

export default class FFMPEGStream {
  private instance: any
  constructor(
    private channels: { type: string; streamKey: string }[],
    private timelinePath: string,
    private logo: string,
    private overlay: string,
    private guestFile: string,
    private enableBrowser: boolean,
    private webpageUrl: string,
    private bitrate: string,
    private resolution: string,
    private fps: number
  ) {}

  async startStream() {
    this.createFifos();

    const inputParameters = [
      '-re', '-hwaccel', 'rkmpp', '-protocol_whitelist', 'file,concat,http,https,tcp,tls,crypto',
      '-f', 'concat', '-safe', '0', '-i', `concat:${this.timelinePath}`
    ];

    let filterComplex: string[] = [];

    console.log('Starting FFmpeg stream...');

    if (this.enableBrowser) {
      await this.startBrowserCapture();
      inputParameters.push('-i', SCREENSHOT_FIFO);
      filterComplex.push(
        `[1:v]colorkey=0xFFFFFF:0.1:0.2,fps=fps=24}[ckout];`,
        `[0:v][ckout]overlay=0:0,fps=fps=${this.fps}[v1]`
      );
    } else {
      filterComplex.push(`[0:v]fps=fps=${this.fps}[v1]`);
    }

    const encodingParameters = [
      '-r', this.fps.toString(), '-filter_complex', filterComplex.join(''),
      '-map', '[v1]', '-map', '0:a?', '-s', this.resolution,
      '-c:a', 'aac', '-c:v', 'h264_rkmpp', '-b:v', this.bitrate,
      '-maxrate', this.bitrate, '-bufsize', `${Number.parseInt(this.bitrate) * 2}k`,
      '-flags', 'low_delay'
    ];

    if (this.channels.length === 1) {
      const channel = this.channels[0];
      const baseUrl = BASE_URLS[channel.type];
      const outputUrl = `${baseUrl}/${encryption.decrypt(channel.streamKey)}`;
      encodingParameters.push('-f', 'flv', outputUrl);
    } else {
      const teeOutput = this.channels.map(channel => {
        const baseUrl = BASE_URLS[channel.type];
        const outputUrl = `${baseUrl}/${encryption.decrypt(channel.streamKey)}`;
        return `[f=flv]${outputUrl}`;
      }).join('|');
      encodingParameters.push('-f', 'tee', teeOutput);
    }

    console.log('FFmpeg command:', 'ffmpeg', [...inputParameters, ...encodingParameters]);
    this.instance = spawn('ffmpeg', [...inputParameters, ...encodingParameters], {
      detached: true, stdio: ['ignore', 'pipe', 'pipe']
    });

    this.instance.stdout.on('data', data => {
      console.log(`FFmpeg stdout: ${data}`);
    });

    this.instance.stderr.on('data', data => {
      logger.info(data.toString());
    });

    return Number.parseInt(this.instance.pid.toString(), 10);
  }

  private async startBrowserCapture() {
    const minimalArgs = [
      '--autoplay-policy=user-gesture-required',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-dev-shm-usage',
      '--disable-domain-reliability',
      '--disable-extensions',
      '--disable-features=AudioServiceOutOfProcess',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-notifications',
      '--disable-offer-store-unmasked-wallet-cards',
      '--disable-popup-blocking',
      '--disable-print-preview',
      '--disable-prompt-on-repost',
      '--disable-renderer-backgrounding',
      '--disable-setuid-sandbox',
      '--disable-speech-api',
      '--disable-sync',
      '--hide-scrollbars',
      '--ignore-gpu-blacklist',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-first-run',
      '--no-pings',
      '--no-sandbox',
      '--no-zygote',
      '--password-store=basic',
      '--use-gl=swiftshader',
      '--use-mock-keychain',
    ]
    const browser = await puppeteer.launch({
      args: [
        '--window-size=640,480',
        '--window-position=640,0',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        ...minimalArgs,
      ],
      executablePath: '/usr/bin/chromium-browser',
      ignoreDefaultArgs: ['--enable-automation'],
    })

    const page = await browser.newPage()
    await page.goto(this.webpageUrl)

    let writeStream
    try {
      writeStream = fs.createWriteStream(SCREENSHOT_FIFO, { flags: 'a' })

      writeStream.on('error', (error) => {
        logger.error('Write stream error:', error.message)
        this.enableBrowser = false
      })

      while (this.enableBrowser) {
        try {
          const screenshot = await page.screenshot({ type: 'jpeg', quality: 50 })
          writeStream.write(screenshot)
          await new Promise((resolve) => setTimeout(resolve, 1))
        } catch (error) {
          logger.error('Error capturing screenshot or writing to FIFO:', error.message)
          this.enableBrowser = false
          break
        }
      }
    } catch (error) {
      logger.error('Error initializing write stream:', error.message)
    } finally {
      if (writeStream) {
        writeStream.end()
      }
      await browser.close()
    }
  }

  private createFifos() {
    ;[SCREENSHOT_FIFO, OUTPUT_FIFO].forEach((fifo) => {
      if (fs.existsSync(fifo)) {
        fs.unlinkSync(fifo)
      }
      spawn('mkfifo', [fifo])
    })
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

  /*stopStream(pid: number): void {
    if (this.instance && pid > 0) {
      logger.info(`Stopping FFmpeg with PID: ${pid}`)
      this.instance.kill('SIGKILL')
    } else {
      logger.error('Cannot stop FFmpeg: instance is undefined or invalid, force stopping process')
      if (pid > 0) process.kill(pid, 'SIGKILL')
    }
    this.removeFifos()
  }*/

  private handleProcessOutputs(instance: any)  {
    instance.stderr.on('data', (data: any) => {
      const output = data.toString()
      logger.info(output)

      // Tentative de capturer le bitrate à partir des logs FFmpeg
      /* const bitrateMatch = output.match(/bitrate=\s*(\d+\.?\d*)\s*kbits\/s/)
       if (bitrateMatch) {
         const bitrate = Number.parseFloat(bitrateMatch[1])
         onBitrateUpdate(bitrate)
       }*/
    })

    instance.on('error', (error: any) => {
      logger.error(error)
    })

    instance.on('close', (code: any) => {
      logger.info(`FFmpeg process closed with code: ${code}`)
      this.removeFifos()
    })
  }
}
