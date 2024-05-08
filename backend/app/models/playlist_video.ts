import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PlaylistVideo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare playlistId: number

  @column()
  declare videoId: number

  @column()
  declare order: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
