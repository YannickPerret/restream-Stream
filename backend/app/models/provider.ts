import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  baseUrl: string = ''

  static async createProvider(provider: Provider): Promise<any> {
    switch (provider.type) {
      case 'twitch':
        const Twitch = (await import('#models/providers/twitch')).default
        return new Twitch(provider)
      default:
        throw new Error(`Provider type ${provider.type} not supported`)
    }
  }
}
