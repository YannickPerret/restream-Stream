import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Guest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare email: string

  @column()
  declare displayName: string

  @column()
  declare ipAddress: string

  @column()
  declare discordUsername: string

  @column()
  declare steamUsername: string

  @column()
  declare twitchUsername: string

  @column()
  declare twitterUsername: string

  @column()
  declare youtubeUsername: string

  @column()
  declare telegramUsername: string

  @column()
  declare canDiffuse: number

  @column()
  declare notes: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
