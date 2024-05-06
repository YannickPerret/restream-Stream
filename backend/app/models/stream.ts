import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import { spawn } from 'node:child_process'
import env from '#start/env'
import Provider from '#models/provider'

export default class Stream extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare pid: number | null

  @column()
  declare status: 'active' | 'inactive'

  @column()
  declare type: string

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime()
  declare startTime: DateTime | null

  @column.dateTime()
  declare endTime: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Provider, {
    pivotTable: 'stream_providers',
    pivotColumns: ['on_primary'],
  })
  declare providers: ManyToMany<typeof Provider>

  instance: any

  declare isOnLive: boolean

  async start(playlist: any = undefined): Promise<void> {
    const parameters = [
      '-nostdin', // Disable stdin interaction
      '-re', // Read file at normal speed
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      playlist ||
        'concat:/Users/tchoune/Documents/dev/js/coffeeStream/backend/ressources/playlists/playlist.m3u8', // Specify input path
      '-vsync',
      'cfr', // Constant Frame Rate
      '-copyts', // Copy timestamps
      '-pix_fmt',
      'yuv420p', // Pixel format needed for compatibility
      '-s',
      '1920x1080', // Output resolution
      '-c:v',
      'libx264', // H.264 video codec
      '-profile:v',
      'high', // H.264 profile
      '-preset',
      'veryfast', // Encoder preset to reduce CPU load
      '-b:v',
      '6000k', // Video bitrate
      '-maxrate',
      '7000k', // Maximum rate
      '-minrate',
      '5000k', // Minimum rate
      '-bufsize',
      '9000k', // Buffer size
      '-g',
      '120', // Interval between key frames
      '-r',
      '60', // Frame rate
      '-c:a',
      'aac', // Audio codec
      '-f',
      'flv', // Output format Flash Video
      `rtmp://live.twitch.tv/app/${env.get('STREAM_KEY')}`, // Streaming URL
    ]

    this.instance = spawn('ffmpeg', parameters, {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    this.handleProcessOutputs(this.instance)

    this.pid = this.instance.pid.toString()
    this.startTime = DateTime.now()
    this.status = 'active'
    this.isOnLive = true

    await this.save()
  }

  async stop(): Promise<void> {
    logger.info('Stopping streams...')

    if (this.instance && this.pid && this.pid > 0) {
      logger.info(`Killing process with PID: ${this.pid}`)
      this.instance.kill('SIGKILL')
      this.endTime = DateTime.now()
      this.status = 'inactive'
      this.isOnLive = false
      this.pid = 0
      await this.save()
    } else {
      logger.error('Cannot stop stream: streamInstance is undefined or invalid.')
    }
  }

  private handleProcessOutputs(instance: any) {
    if (instance?.stderr) {
      instance.stderr.on('data', (data: any) => {
        logger.error(data.toString())
      })
    }

    if (instance?.stdout) {
      instance.stdout.on('data', (data: any) => {
        logger.info(data.toString())
      })
    }

    instance.on('error', (error: any) => {
      logger.error(error)
    })
  }
}
