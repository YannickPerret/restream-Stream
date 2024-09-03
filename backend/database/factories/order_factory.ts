import factory from '@adonisjs/lucid/factories'
import Order from '#models/order'

export const OrderFactory = factory
  .define(Order, async ({ faker }) => {
    return {}
  })
  .build()