import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Timeline from '#models/timeline'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Video from '#models/video'
import Playlist from '#models/playlist'

export default class TimelineItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare timelineId: number

  @column()
  declare order: number

  @belongsTo(() => Timeline)
  declare timeline: BelongsTo<typeof Timeline>

  @column()
  declare type: 'video' | 'playlist'

  @column()
  declare itemId: number

  @belongsTo(() => Video, { foreignKey: 'itemId' })
  declare video: BelongsTo<typeof Video>

  @belongsTo(() => Playlist, { foreignKey: 'itemId' })
  declare playlist: BelongsTo<typeof Playlist>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
