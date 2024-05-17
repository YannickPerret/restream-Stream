// backend/app/providers/ffmpeg_provider.ts
import { spawn } from 'node:child_process'
import logger from '@adonisjs/core/services/logger'

export interface StreamProvider {
  startStream(playlist?: string): void
  stopStream(): void
  isActive(): boolean
}

export default class Ffmpeg implements StreamProvider {
  private instance: any = null
  private pid: number = 0
  private isOnLive: boolean = false

  constructor(
    private baseUrl: string,
    private streamKey: string,
    private timelinePath: string
  ) {}

  startStream(): void {
    const parameters = [
      '-nostdin',
      '-re',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      this.timelinePath,
      '-vsync',
      'cfr',
      '-copyts',
      '-pix_fmt',
      'yuv420p',
      '-s',
      '1920x1080',
      '-c:v',
      'libx264',
      '-profile:v',
      'high',
      '-preset',
      'veryfast',
      '-b:v',
      '6000k',
      '-maxrate',
      '7000k',
      '-minrate',
      '5000k',
      '-bufsize',
      '9000k',
      '-g',
      '120',
      '-r',
      '60',
      '-c:a',
      'aac',
      '-f',
      'flv',
      `${this.baseUrl}/${this.streamKey}`,
    ]

    this.instance = spawn('ffmpeg', parameters, {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    this.handleProcessOutputs(this.instance)

    this.pid = Number.parseInt(this.instance.pid.toString(), 10)
    this.isOnLive = true

    logger.info(`FFmpeg started with PID: ${this.pid}`)
  }

  stopStream(): void {
    if (this.instance && this.pid > 0) {
      logger.info(`Stopping FFmpeg with PID: ${this.pid}`)
      this.instance.kill('SIGKILL')
      this.pid = 0
      this.isOnLive = false
    } else {
      logger.error('Cannot stop FFmpeg: instance is undefined or invalid.')
    }
  }

  isActive(): boolean {
    return this.isOnLive
  }

  private handleProcessOutputs(instance: any) {
    if (instance?.stderr) {
      instance.stderr.on('data', (data: any) => {
        logger.info(data.toString())
      })
    }

    if (instance?.stdout) {
      instance.stdout.on('data', (data: any) => {
        logger.error(data.toString())
      })
    }

    instance.on('error', (error: any) => {
      logger.error(error)
    })

    instance.on('close', (code: any) => {
      logger.info(`FFmpeg process closed with code: ${code}`)
      this.stopStream()
    })
  }
}
