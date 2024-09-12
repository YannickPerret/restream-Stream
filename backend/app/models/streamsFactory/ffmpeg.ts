import { spawn } from 'node:child_process';
import logger from '@adonisjs/core/services/logger';
import app from '@adonisjs/core/services/app';
import encryption from '@adonisjs/core/services/encryption';
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import env from "#start/env";

export interface StreamProvider {
  startStream(onBitrateUpdate: (bitrate: number) => void): number;
  stopStream(pid: number): void;
}

const SCREENSHOT_FIFO = '/tmp/screenshot_fifo';
const OUTPUT_FIFO = '/tmp/puppeteer_stream';

export default class Ffmpeg implements StreamProvider {
  private instance: any = null;
  private browserStarted: boolean = false;

  constructor(
    private baseUrl: string,
    private streamKey: string,
    private timelinePath: string,
    private logo: string,
    private overlay: string,
    private guestFile: string,
    private enableBrowser: boolean,
    private webpageUrl: string,
    private bitrate: string,
    private resolution: string,
    private fps: number,
  ) {}

  startStream(onBitrateUpdate: (bitrate: number) => void): number {
    this.createFifos();

    const parameters = [
      '-hwaccel', 'auto',
      '-protocol_whitelist', 'file,concat,http,https,tcp,tls,crypto',
      '-f', 'concat',
      '-safe', '0',
      '-i', `concat:${app.publicPath(env.get('TIMELINE_PLAYLIST_DIRECTORY'),this.timelinePath)}`,
      '-r', this.fps,
    ];

    let filterComplex: string[] = [];

    if (this.enableBrowser) {
      this.startBrowserCapture();
      parameters.push('-i', SCREENSHOT_FIFO);

      filterComplex.push(
        '[1:v]colorkey=0xFFFFFF:0.1:0.2,fps=fps=30[ckout];',
        `[0:v][ckout]overlay=0:0,fps=fps=${this.fps}[v1]`
      );
    } else {
      filterComplex.push(`[0:v]fps=fps=${this.fps}[v1]`);
    }

    parameters.push(
      '-filter_complex', filterComplex.join(''),
      '-map', '[v1]',
      '-map', '0:a?',
      '-analyzeduration', '1',
      '-s', this.resolution,
      '-c:a', 'aac',
      '-c:v', 'libx264',
      '-keyint_min', (this.fps * 2).toString(),
      '-preset', 'ultrafast',
      '-b:v', this.bitrate,
      '-tune', 'zerolatency',
      '-flags', 'low_delay',
      '-maxrate', this.bitrate,
      '-crf', '29',
      '-r', this.fps,
      '-f', 'flv',
      `${this.baseUrl}/${encryption.decrypt(this.streamKey)}`
    );

    this.instance = spawn('ffmpeg', parameters, {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    this.handleProcessOutputs(this.instance, onBitrateUpdate);
    return Number.parseInt(this.instance.pid.toString(), 10);
  }

  private buildFilterComplex(): string {
    let filterComplex: string[] = [];

    if (this.enableBrowser) {
      try {
        this.startBrowserCapture();
        filterComplex.push(
          '[1:v]colorkey=0xFFFFFF:0.1:0.2,fps=fps=30[ckout];',
          '[0:v][ckout]overlay=0:0,fps=fps=30[v1]'
        );
        this.browserStarted = true;
      } catch (error) {
        logger.error('Failed to start browser capture: ', error);
        this.browserStarted = false;
      }
    }

    if (!this.browserStarted) {
      // If the browser is not started, fallback to simpler filter
      filterComplex.push('[0:v]fps=fps=30[v1]');
    }

    return filterComplex.join('');
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
    ];
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
      ignoreDefaultArgs: ['--enable-automation'],
    });

    const page = await browser.newPage();
    await page.goto(this.webpageUrl);

    let writeStream;
    try {
      writeStream = fs.createWriteStream(SCREENSHOT_FIFO, { flags: 'a' });

      writeStream.on('error', (error) => {
        logger.error('Write stream error:', error.message);
        this.enableBrowser = false;
      });

      while (this.enableBrowser) {
        try {
          const screenshot = await page.screenshot({ type: 'jpeg', quality: 50 });
          writeStream.write(screenshot);
          await new Promise((resolve) => setTimeout(resolve, 1));
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
      await browser.close();
    }
  }

  private createFifos() {
    [SCREENSHOT_FIFO, OUTPUT_FIFO].forEach((fifo) => {
      if (fs.existsSync(fifo)) {
        fs.unlinkSync(fifo);
      }
      spawn('mkfifo', [fifo]);
    });
  }

  private removeFifos() {
    [SCREENSHOT_FIFO, OUTPUT_FIFO].forEach((fifo) => {
      try {
        if (fs.existsSync(fifo)) {
          fs.unlinkSync(fifo);
          console.log(`FIFO ${fifo} removed successfully.`);
        }
      } catch (error) {
        console.error(`Failed to remove FIFO ${fifo}:`, error.message);
      }
    });
  }

  stopStream(pid: number): void {
    if (this.instance && pid > 0) {
      logger.info(`Stopping FFmpeg with PID: ${pid}`);
      this.instance.kill('SIGKILL');
    } else {
      logger.error('Cannot stop FFmpeg: instance is undefined or invalid, force stopping process');
      if (pid > 0) process.kill(pid, 'SIGKILL');
    }
    this.removeFifos();
  }

  private handleProcessOutputs(instance: any, onBitrateUpdate: (bitrate: number) => void) {
    instance.stderr.on('data', (data: any) => {
      const output = data.toString();
      logger.info(output);

      // Tentative de capturer le bitrate à partir des logs FFmpeg
      const bitrateMatch = output.match(/bitrate=\s*(\d+\.?\d*)\s*kbits\/s/);
      if (bitrateMatch) {
        const bitrate = Number.parseFloat(bitrateMatch[1]);
        onBitrateUpdate(bitrate);
      }
    });

    instance.on('error', (error: any) => {
      logger.error(error);
    });

    instance.on('close', (code: any) => {
      logger.info(`FFmpeg process closed with code: ${code}`);
      this.removeFifos();
    });
  }
}
