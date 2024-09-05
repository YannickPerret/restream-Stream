import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Product from '#models/product'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Feature from '#models/feature'

export default class ProductFeature extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number

  @column()
  declare featureId: number

  @column()
  declare value: string

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Feature)
  declare feature: BelongsTo<typeof Feature>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
