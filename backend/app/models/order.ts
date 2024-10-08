import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
  hasMany,
  hasOne,
  manyToMany,
  scope,
} from '@adonisjs/lucid/orm'
import Payment from '#models/payment'
import User from '#models/user'
import type { BelongsTo, HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import OrderItem from '#models/order_item'
import { cuid } from '@adonisjs/core/helpers'
import Discount from '#models/discount'
import Invoice from '#models/invoice'
import InvoiceService from '#services/invoice_service'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare totalAmount: number

  @column()
  declare currency: string

  @column()
  declare status: 'pending' | 'waitingToPaid' | 'paid' | 'completed' | 'cancelled'

  @column()
  declare slug: string

  @column()
  declare invoiceId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @manyToMany(() => Discount, {
    pivotTable: 'order_discounts',
  })
  declare discounts: ManyToMany<typeof Discount>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasOne(() => Payment)
  declare payment: HasOne<typeof Payment>

  @belongsTo(() => Invoice)
  declare invoice: BelongsTo<typeof Invoice>

  @beforeCreate()
  static async generateSlug(order: Order) {
    order.slug = cuid()
  }

  async createInvoice(template) {
    const invoicePDFPath = await InvoiceService.createInvoice(template)
    return await Invoice.create({
      filename: invoicePDFPath,
      status: 'generated',
      slug: cuid(),
    })
  }

  static async hasProductFromGroup(userId: number, productGroupId: number): Promise<boolean> {
    const existingOrder = await this.query()
      .where('userId', userId)
      .whereHas('items', (query) => {
        query.whereHas('product', (productQuery) => {
          productQuery.where('product_group_id', productGroupId)
        })
      })
      .first()

    return !!existingOrder
  }
  static applyFilters = scope((query, filters) => {
    Object.keys(filters).forEach((key) => {
      const value = filters[key]
      if (Array.isArray(value)) {
        query.whereIn(key, value)
      } else {
        query.where(key, value)
      }
    })
  })
}
