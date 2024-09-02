import { BaseModel, beforeCreate, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import Stream from '#models/stream'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import encryption from '@adonisjs/core/services/encryption'

export default class Provider extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare streamKey: string

  @column()
  declare type: string

  @column()
  declare authBearer: string

  @column()
  declare clientId: string

  @column()
  declare clientSecret: string

  @column()
  declare refreshToken: string

  @column()
  declare accessToken: string

  @column()
  declare broadcasterId: string

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Stream, {
    pivotTable: 'stream_providers',
    pivotColumns: ['on_primary'],
  })
  declare streams: ManyToMany<typeof Stream>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  baseUrl: string = ''

  @beforeCreate()
  static async encryptStreamKey(provider: Provider) {
    provider.streamKey = encryption.encrypt(provider.streamKey)
  }

  static async createProvider(provider: Provider): Promise<any> {
    switch (provider.type) {
      case 'twitch':
        const Twitch = (await import('#models/providers/twitch')).default
        return new Twitch(provider)
      case 'youtube':
        const Youtube = (await import('#models/providers/youtube')).default
        return new Youtube(provider)
      default:
        throw new Error(`Provider type ${provider.type} not supported`)
    }
  }
}
