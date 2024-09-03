import factory from '@adonisjs/lucid/factories'
import Payment from '#models/payment'

export const PaymentFactory = factory
  .define(Payment, async ({ faker }) => {
    return {}
  })
  .build()