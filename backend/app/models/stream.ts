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

  @column()
  declare providerId: number

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

  declare instance: any
  declare isOnLive: boolean
  declare canNextVideo: boolean
  declare providersInstance: Provider[]
  declare primaryProvider: Provider | null

  async run() {
    logger.info('Starting stream...')

    const providers = await this.related('providers').query().pivotColumns(['on_primary'])
    this.providersInstance = await Promise.all(
      providers.map((provider) => Provider.createProvider(provider))
    )
    const primary = this.providersInstance.find(
      (provider) => provider.$extras.pivot_on_primary === 1
    )
    this.primaryProvider = primary ?? null

    if (this.primaryProvider) {
      logger.info(`Primary provider found: ${this.primaryProvider.name}`)
    } else {
      logger.warn('No primary provider found')
    }

    await this.start()
    this.canNextVideo = true

    await this.save()
  }

  async start(playlist: any = undefined): Promise<void> {
    const parameters = [
      '-nostdin',
      '-re',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      playlist ||
        'concat:/Users/tchoune/Documents/dev/js/coffeeStream/backend/ressources/playlists/playlist.m3u8', // Specify input path
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
      `${this.primaryProvider?.baseUrl}/${this.primaryProvider?.streamKey}`, // Streaming URL
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

  async getPrimaryProvider() {
    const providers = await this.related('providers').query().pivotColumns(['on_primary'])
    const primary = providers.find((provider) => provider.$extras.pivot_on_primary === 1)
    return primary ?? null
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
