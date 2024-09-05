import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Subscription from '#models/subscription'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Feature from '#models/feature'

export default class SubscriptionFeature extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare subscriptionId: number

  @column()
  declare featureId: number

  @column()
  declare value: string | null

  @belongsTo(() => Subscription)
  declare subscription: BelongsTo<typeof Subscription>

  @belongsTo(() => Feature)
  declare feature: BelongsTo<typeof Feature>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
