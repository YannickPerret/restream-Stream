import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'
import Order from '#models/order'
import Stripe from "stripe";
import env from "#start/env";

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare orderId: number

  @column()
  declare stripePaymentIntentId: string

  @column()
  declare amount: number

  @column()
  declare currency: string

  @column()
  declare status: string

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

  static async createPaymentIntent(
    order: { totalAmount: number; id: number; currency: string },
    user: { id: number },
    payment: { paymentMethodId: string; returnUrl: string }
  ) {
    try {

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100),
        currency: order.currency || 'usd',
        payment_method: payment.paymentMethodId,
        return_url: payment.returnUrl,
        confirm: true,
        metadata: {
          order_id: order.id,
          user_id: user.id,
        },
      })

      return paymentIntent
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw new Error('Unable to create payment intent')
    }
  }
}
