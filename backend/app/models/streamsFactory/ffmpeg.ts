import { spawn } from 'node:child_process'
import logger from '@adonisjs/core/services/logger'

export interface StreamProvider {
  startStream(): number
  stopStream(pid: number): void
}

export default class Ffmpeg implements StreamProvider {
  private instance: any = null

  constructor(
    private baseUrl: string,
    private streamKey: string,
    private timelinePath: string,
    private logo: string,
    private overlay: string,
    private guestFile: string,
    private cryptoFile: string
  ) {}

  startStream(): number {
    const parameters = [
      '-nostdin',
      '-re',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      this.timelinePath,
      '-i',
      this.logo,
      '-i',
      this.overlay ||
        '/Users/tchoune/Documents/dev/js/coffeeStream/backend/public/assets/streams/overlays/overlay1.png',
      '-filter_complex',
      `[1:v]scale=200:-1[logo];[2:v]scale=-1:ih[overlay];[0:v][logo]overlay=W-w-5:5[main];[main][overlay]overlay=0:H-h[main]; [main]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:textfile=${this.guestFile}:reload=1:x=(w-text_w)/2:y=h-text_h-10:fontsize=18:fontcolor=white[main]; [main]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='%{localtime\\:%X}':x=10:y=h-text_h-10:fontsize=16:fontcolor=white[main]; [main]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:textfile=${this.cryptoFile}:reload=1:x=w-text_w-10:y=h-text_h-10:fontsize=16:fontcolor=white`,
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

    return Number.parseInt(this.instance.pid.toString(), 10)
  }

  stopStream(pid: number): void {
    if (this.instance && pid > 0) {
      logger.info(`Stopping FFmpeg with PID: ${pid}`)
      this.instance.kill('SIGKILL')
    } else {
      logger.error('Cannot stop FFmpeg: instance is undefined or invalid, force stopping process')
      if (pid > 0) process.kill(pid, 'SIGKILL')
    }
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
    })
  }
}
