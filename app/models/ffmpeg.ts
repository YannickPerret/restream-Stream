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
    }

    if (this.enableBrowser) {
      console.log('Browser capture enabled.')
      this.startBrowserCapture().catch((error) => {
        logger.error('Failed to start browser capture:', error.message)
      })

      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    const inputParameters = [
      '-hwaccel', 'rkmpp']

    if (this.enableBrowser) {
      inputParameters.push(
        '-f',
        'image2pipe',
        '-framerate',
        '15',
        '-vcodec',
        'mjpeg',
        '-i',
        FIFO_PATH
      )
    }
    inputParameters.push(
      '-protocol_whitelist',
      'file,concat,http,https,tcp,tls,crypto',
      '-safe',
      '0',
      '-f',
      'concat',
      '-i',
      this.timelinePath
    )


    if (this.showWatermark) {
      inputParameters.push('-i', app.publicPath('watermark/watermark.png'))
    }
    let filterComplex: string[] = []


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
      '[final]',
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
        console.log('FFmpeg exited unexpectedly. Attempting to restart...')
        setTimeout(() => this.startStream(), RESTART_DELAY_MS)
      }
    })

    const pid = this.instance.pid
    console.log(`Stream ${this.streamId} started with PID ${pid}`)
  }

  private async startBrowserCapture() {
    const browser = await chromium.launch({
      args: [
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-accelerated-2d-canvas',
        '--disable-web-security',
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
      ],
      headless: true,
    })

    const [width, height] = this.resolution.split('x').map(Number)

    const page = await browser.newPage({
      viewport: { width, height },
    })

    await page.goto(this.webpageUrl, { waitUntil: 'load', timeout: 7000 })
    logger.info(`Browser navigated to ${this.webpageUrl} successfully.`)

    // Ouvrir le FIFO en écriture
    this.fifoWriteStream = fs.createWriteStream(FIFO_PATH)

    this.captureAndStreamScreenshots(page).catch((error) => {
      logger.error('Error in capture process:', error.message)
    })
  }

  private async captureAndStreamScreenshots(page: any) {
    try {
      while (this.enableBrowser) {
        const screenshotBuffer = await page.screenshot({
          type: 'jpeg',
        })

        // Écrire le buffer dans le FIFO
        this.fifoWriteStream.write(screenshotBuffer)

        await new Promise((resolve) => setTimeout(resolve, 1000 / 10)) // 10 FPS
      }
    } catch (error) {
      logger.error('Error capturing screenshot:', error.message)
      this.enableBrowser = false
    } finally {
      // Fermer le FIFO
      if (this.fifoWriteStream) {
        this.fifoWriteStream.end()
      }
      await page.close()
      await page.context().browser().close()
    }
  }

  stopStream = async (pid: number) => {
    this.isStopping = true
    if (this.instance) {
      process.kill(pid, 'SIGKILL')
    }
    if (this.analyticsInterval) {
      clearInterval(this.analyticsInterval)
    }
    if (this.timeTrackingInterval) {
      clearInterval(this.timeTrackingInterval)
    }
    await redis.del(`stream:${this.streamId}:elapsed_time`)

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
