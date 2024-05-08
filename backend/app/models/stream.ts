import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import Provider from '#models/provider'
import StreamFactory from '#models/streamsFactory/stream_factory'
import { StreamProvider } from '#models/streamsFactory/ffmpeg'

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

  declare streamProvider: StreamProvider | null
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
      this.streamProvider = StreamFactory.createProvider(
        'ffmpeg',
        this.primaryProvider.baseUrl,
        this.primaryProvider.streamKey
      )
      await this.start()
    } else {
      logger.warn('No primary provider found')
    }

    this.canNextVideo = true
    await this.save()
  }

  async start(playlist: any = undefined): Promise<void> {
    logger.info(`Using primary provider: ${JSON.stringify(this.primaryProvider)}`)

    this.streamProvider?.startStream(playlist)

    this.startTime = DateTime.now()
    this.status = 'active'
    this.isOnLive = true
    await this.save()
  }

  async stop(): Promise<void> {
    logger.info('Stopping streams...')
    this.streamProvider?.stopStream()
    this.endTime = DateTime.now()
    this.status = 'inactive'
    this.isOnLive = false
    await this.save()
  }

  async getPrimaryProvider() {
    const providers = await this.related('providers').query().pivotColumns(['on_primary'])
    const primary = providers.find((provider) => provider.$extras.pivot_on_primary === 1)
    return primary ?? null
  }
}
