import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Guest from '#models/guest'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Video from '#models/video'

export default class GuestToken extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare guestId: number

  @column()
  declare videoId: number

  @column()
  declare token: string

  @column()
  declare status: string

  @column.dateTime()
  declare expiresAt: DateTime

  @belongsTo(() => Guest)
  declare guest: BelongsTo<typeof Guest>

  @belongsTo(() => Video)
  declare video: BelongsTo<typeof Video>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
