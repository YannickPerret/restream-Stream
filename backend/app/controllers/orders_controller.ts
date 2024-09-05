import type { HttpContext } from '@adonisjs/core/http'
import OrderItem from '#models/order_item'
import Payment from '#models/payment'
import Product from '#models/product'
import UserAddress from '#models/user_address'
import { DateTime } from 'luxon'
import Order from '#models/order'
import Subscription from '#models/subscription'

export default class OrdersController {
  /**
   * Create a new order
   */
  async create({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    if (!user) return response.badRequest()

    const { items, isMonthly, currency, paymentMethodId, returnUrl, address } = request.only([
      'items',
      'isMonthly',
      'currency',
      'paymentMethodId',
      'returnUrl',
      'address',
    ])

    try {
      await UserAddress.firstOrCreate(
        { address: address.address },
        {
          userId: user.id,
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          address: address.address,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country,
        }
      )

      // Check for existing active subscriptions
      for (const item of items) {
        const hasSubscription = await user.haveSubscriptionByProductId(item.productId)
        if (hasSubscription) {
          return response.badRequest({
            error: `You already have an active subscription for this product`,
          })
        }
      }

      // Calculate total amount
      let totalAmount = 0
      const orderItems = []

      for (const item of items) {
        const product = await Product.findOrFail(item.productId)
        totalAmount += item.quantity * isMonthly ? product.monthlyPrice : product.annualPrice

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.monthlyPrice,
          totalAmount: item.quantity * isMonthly ? product.monthlyPrice : product.annualPrice,
        })
      }

      // Create the Order
      const order = await Order.create({
        userId: user.id,
        totalAmount,
        status: 'pending',
        currency: currency,
      })

      // Create the Order Items
      await OrderItem.createMany(
        orderItems.map((item) => ({
          ...item,
          orderId: order.id,
        }))
      )

      // Create Payment Intent using the static method on Payment model
      const paymentIntent = await Payment.createPaymentIntent(order, user, {
        paymentMethodId,
        returnUrl,
      })

      const payment = await Payment.create({
        orderId: order.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: order.totalAmount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      })

      if (payment.status === 'succeeded') {
        order.status = 'completed'
        await order.save()

        for (const item of orderItems) {
          const product = await Product.findOrFail(item.productId)

          // Calculate expiration date
          const expiresAt = isMonthly
            ? DateTime.now().plus({ months: 1 })
            : DateTime.now().plus({ years: 1 })

          // Create subscription
          await Subscription.create({
            userId: user.id,
            productId: product.id,
            orderId: order.id,
            status: 'active',
            expires_at: expiresAt,
          })
        }
      }

      return response.json({ success: true, order, paymentIntent })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: error.message })
    }
  }

  /**
   * Show details of a single order
   */
  async show({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    if (!user) return response.badRequest()

    try {
      const order = await Order.query()
        .where('id', params.id)
        .andWhere('user_id', user.id)
        .preload('items', (itemQuery) => {
          itemQuery.preload('product')
        })
        .preload('payment')
        .firstOrFail()

      return response.json({ success: true, order })
    } catch (error) {
      console.error(error)
      return response.status(404).json({ error: 'Order not found' })
    }
  }

  /**
   * List all orders for the authenticated user
   */
  async index({ response, auth }: HttpContext) {
    const user = await auth.authenticate()
    if (!user) return response.badRequest()

    try {
      const orders = await Order.query()
        .where('user_id', user.id)
        .preload('items', (itemQuery) => {
          itemQuery.preload('product')
        })
        .preload('payment')

      return response.json({ success: true, orders })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: error.message })
    }
  }

  /**
   * Update the status of an order (e.g., mark as completed or canceled)
   */
  async update({ params, request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    if (!user) return response.badRequest()

    const { status } = request.only(['status'])

    try {
      const order = await Order.query()
        .where('id', params.id)
        .andWhere('user_id', user.id)
        .firstOrFail()

      order.status = status
      await order.save()

      return response.json({ success: true, order })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Failed to update order status' })
    }
  }

  /**
   * Delete an order (and associated items)
   */
  async delete({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    if (!user) return response.badRequest()

    try {
      const order = await Order.query()
        .where('id', params.id)
        .andWhere('user_id', user.id)
        .firstOrFail()

      await order.delete()

      return response.json({ success: true, message: 'Order deleted' })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Failed to delete order' })
    }
  }
}
