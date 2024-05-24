import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Queue from '#models/queue'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Video from '#models/video'

export default class QueueItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare queueId: number

  @column()
  declare videoId: number

  @column()
  declare startTimeCode: string | null

  @column()
  declare endTimeCode: string | null

  @column()
  declare attempts: number

  @column()
  declare status: 'pending' | 'processing' | 'completed' | 'failed'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Queue)
  declare queue: BelongsTo<typeof Queue>

  @belongsTo(() => Video)
  declare video: BelongsTo<typeof Video>
}
