import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Order from '#models/order'
import Discount from '#models/discount'
import Product from '#models/product'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class OrderDiscount extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare discountId: number

  @column()
  declare scope: 'product' | 'order'

  @column()
  declare productId: number | null

  @column()
  declare appliedAmount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @belongsTo(() => Discount)
  declare discount: BelongsTo<typeof Discount>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product> | null
}
