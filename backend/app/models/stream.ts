import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany, afterCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import Provider from '#models/provider'
import StreamFactory from '#models/streamsFactory/stream_factory'
import { StreamProvider } from '#models/streamsFactory/ffmpeg'
import Timeline from '#models/timeline'
import Video from '#models/video'
import transmit from '@adonisjs/transmit/services/main'
import * as fs from 'node:fs'
import { cuid } from '@adonisjs/core/helpers'
import path from 'node:path'
import app from '@adonisjs/core/services/app'

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

  @column()
  declare timelineId: number

  @column()
  declare overlay: string | null | undefined

  @column()
  declare guestFile: string

  @column()
  declare cryptoFile: string

  @column()
  declare logo: string | null | undefined

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

  @belongsTo(() => Timeline)
  declare timeline: BelongsTo<typeof Timeline>

  declare streamProvider: StreamProvider | null
  declare isOnLive: boolean
  declare canNextVideo: boolean
  declare providersInstance: Provider[]
  declare primaryProvider: Provider | null
  declare streamStartTime: DateTime
  declare nextVideoTimeout: NodeJS.Timeout | null

  @afterCreate()
  static async createBaseFiles(stream: Stream) {
    const dir = `${app.makePath('resources/datas/streams')}`

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    stream.guestFile = path.join(dir, `${cuid()}_guest.txt`)
    stream.cryptoFile = path.join(dir, `${cuid()}_crypto.txt`)

    fs.writeFileSync(stream.guestFile, 'Upload by : CoffeeStream')
    fs.writeFileSync(stream.cryptoFile, 'Market : 0.00 XNeuros')

    await stream.save()
  }

  async updateGuestText() {
    const currentVideo = await this.timeline.getCurrentVideo()
    await currentVideo.load('guest')
    if (currentVideo.guest) {
      fs.writeFileSync(
        this.guestFile,
        `Upload by : ${currentVideo.guest.username || 'CoffeeStream'}`
      )
    } else {
      console.error('Guest is not loaded for the current video')
    }
  }

  async updateCryptoText() {
    // 22 may 2024 - Perret - Fetch created by Quentin Neves
    const cryptoCurrency = await fetch(
      'https://www.coingecko.com/price_charts/30105/usd/24_hours.json',
      {
        method: 'GET',
      }
    )
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        return data.stats[data.stats.length - 1][1]
      })
    logger.info(`Crypto : ${cryptoCurrency}`)
    const cryptoTitle = cryptoCurrency ? cryptoCurrency : ''
    fs.writeFileSync(this.cryptoFile, `Market : ${cryptoTitle} XNeuros`)
  }

  async nextVideo() {
    if (!this.isOnLive || !this.canNextVideo) {
      logger.info('Stream is not live or not ready to switch videos.')
      return
    }

    const currentVideo: Video = await this.timeline.getCurrentVideo()
    const durationMs: number = await currentVideo?.getDurationInMilisecond()
    logger.info(`Attente de ${durationMs}ms que la video ${currentVideo.title} se termine.`)

    const totalStreamTime = DateTime.now().diff(this.streamStartTime).as('milliseconds')
    logger.info(
      `Temps total de stream : ${totalStreamTime / 60 / 60}h (${totalStreamTime} secondes)`
    )

    if (totalStreamTime > 115200000) {
      logger.info('28h de stream atteint, arrêt du stream')
      this.canNextVideo = false
      this.nextVideoTimeout = setTimeout(() => {
        this.restart()
      }, durationMs)
    } else {
      this.nextVideoTimeout = setTimeout(async () => {
        if (!this.isOnLive) {
          logger.info('Stream has been stopped. Not proceeding to the next video.')
          return
        }
        await this.timeline.moveToNextVideo()
        const nextVideo = await this.timeline.getCurrentVideo()

        if (!nextVideo) {
          // restart stream with timeline
          logger.info('Fin de la playlist.')
          await this.stop()
          return
        }

        await this.updateGuestText()

        await this.nextVideo()
      }, durationMs)
    }
  }

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
      this.streamProvider = StreamFactory.createProvider(
        'ffmpeg',
        this.primaryProvider.baseUrl,
        this.primaryProvider.streamKey,
        this.timeline.filePath,
        this.logo || '',
        this.overlay || '',
        this.guestFile,
        this.cryptoFile
      )

      await this.updateCryptoText()
      await this.updateGuestText()
      await this.start()

      transmit.broadcast(`stream/${this.id}/currentVideo`, {
        currentVideo: await this.timeline.getCurrentVideo(),
      })

      this.timeline.currentVideoIndex = 0
      this.streamStartTime = DateTime.now()
      this.canNextVideo = true

      await this.nextVideo()
    } else {
      logger.warn('No primary provider found')
    }
    await this.save()
  }

  async start(): Promise<void> {
    logger.info(`timeline: ${await this.timeline.videos()}`)

    this.streamProvider?.startStream()

    this.startTime = DateTime.now()
    this.status = 'active'
    this.isOnLive = true
    await this.save()
  }

  async stop(): Promise<void> {
    logger.info('Stopping streams...')
    clearTimeout(this.nextVideoTimeout as NodeJS.Timeout)
    this.streamProvider?.stopStream()
    this.endTime = DateTime.now()
    this.status = 'inactive'
    this.isOnLive = false

    await this.save()
  }

  async restart() {
    await this.stop()
    await this.start()
  }

  async getPrimaryProvider() {
    const providers = await this.related('providers').query().pivotColumns(['on_primary'])
    const primary = providers.find((provider) => provider.$extras.pivot_on_primary === 1)
    return primary ?? null
  }
}
