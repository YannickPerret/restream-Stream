import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Stream extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare pid: number | null

  @column()
  declare status: 'active' | 'inactive'

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
}
