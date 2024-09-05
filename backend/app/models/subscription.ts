import { DateTime } from 'luxon'
import {BaseModel, belongsTo, column, hasMany} from '@adonisjs/lucid/orm'
import User from '#models/user'
import type {BelongsTo, HasMany} from '@adonisjs/lucid/types/relations'
import Product from '#models/product'
import Order from '#models/order'
import SubscriptionFeature from "#models/subscription_feature";

export default class Subscription extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare productId: number

  @column()
  declare orderId: number

  @column()
  declare status: 'inactive' | 'active' | 'expired' | 'canceled'

  @column.dateTime()
  declare expires_at: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @hasMany(() => SubscriptionFeature)
  declare features: HasMany<typeof SubscriptionFeature>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
