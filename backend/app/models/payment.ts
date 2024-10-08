import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'
import Order from '#models/order'
import Stripe from 'stripe'
import env from '#start/env'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare paymentProvider: string

  @column()
  declare paymentProviderId: string

  @column()
  declare amount: number

  @column()
  declare currency: string

  @column()
  declare status: string

  @column()
  declare userId?: number

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  static stripe = new Stripe(env.get('STRIPE_KEY_PRIVATE'), {
    apiVersion: '2024-06-20',
  })

  static async recordPayment(order: Order, user: User, provider: string, providerPaymentId: string, amount: number, currency: string, status: string) {
    return await Payment.create({
      orderId: order.id,
      paymentProvider: provider,
      paymentProviderId: providerPaymentId,
      amount,
      currency,
      status,
      userId: user?.id,
    });
  }
}
