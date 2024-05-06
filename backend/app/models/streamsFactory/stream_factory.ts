import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { inject } from '@adonisjs/core'

export default class StreamFactory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @inject()
  static async createStream(provider: String): Promise<any> {
    switch (provider) {
      case 'ffmpeg':
        const Ffmpeg = (await import('#models/streamsFactory/ffmpeg')).default
        return new Ffmpeg(provider)
      case 'gstreamer':
        return new Error('Provider type gstreamer not supported')
      default:
        throw new Error(`Provider type ${provider} not supported`)
    }
  }
}
