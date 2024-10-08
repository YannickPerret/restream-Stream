import type { HttpContext } from '@adonisjs/core/http'
import OrderItem from '#models/order_item'
import Product from '#models/product'
import UserAddress from '#models/user_address'
import Order from '#models/order'
import Subscription from '#models/subscription'
import Discount from '#models/discount'
import ProductGroup from '#models/product_group'
import PaymentFactory from '#models/paymentGateway/PaymentGateway'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import InvoiceService from '#services/invoice_service'
import Asset from '#models/asset'
import env from '#start/env'

export default class OrdersController {
  async index({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user) return response.badRequest()

    try {
      const orders = await Order.query()
        .where('userId', user.id)
        .preload('items', (itemQuery) => {
          itemQuery.preload('product')
        })
        .preload('payment')
        .preload('invoice')

      return response.json(orders)
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: error.message })
    }
  }

  async store({ request, response, auth, view }: HttpContext) {
    const user = auth.getUserOrFail()

    const {
      firstName,
      lastName,
      phone,
      items,
      isMonthly,
      currency,
      paymentMethodId,
      returnUrl,
      address,
      discounts,
    } = request.only([
      'firstName',
      'lastName',
      'phone',
      'items',
      'isMonthly',
      'currency',
      'paymentMethodId',
      'returnUrl',
      'address',
      'discounts',
    ])

    try {
      await UserAddress.firstOrCreate(
        { address: address.address },
        {
          userId: user.id,
          firstName,
          lastName,
          phone,
          address: address.address,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country,
        }
      )

      let totalAmount = 0
      const orderItems = []

      let discountAmount = 0
      const appliedDiscounts = []

      let hasSubscriptionProduct = false

      for (const item of items) {
        const product = await Product.findOrFail(item.productId)
        const productPrice =
          product.purchaseType === 'subscription'
            ? isMonthly
              ? product.monthlyPrice
              : product.annualPrice - product.directDiscount
            : product.price

        if (product.purchaseType === 'subscription') {
          hasSubscriptionProduct = true
        }

        // Validation du groupe de produit (si applicable)
        const productGroup = await ProductGroup.find(product.productGroupId)
        if (!productGroup?.multiple) {
          const hasProductFromGroup = await Order.hasProductFromGroup(
            user.id,
            product.productGroupId
          )

          if (hasProductFromGroup) {
            return response.badRequest({
              error: `You already have a product from the group '${productGroup?.name}' in your previous orders.`,
            })
          }
        }

        totalAmount += item.quantity * productPrice
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: productPrice,
          totalAmount,
          frequency: isMonthly ? 'monthly' : 'yearly',
        })
      }

      for (const code of discounts || []) {
        const discount = await Discount.findOrFail(code)

        if (!discount.isValid()) {
          return response.badRequest({ error: `Discount code ${discount.name} is not valid.` })
        }

        if (discount.minimumPurchase && totalAmount < discount.minimumPurchase) {
          return response.badRequest({
            error: `Discount ${discount.name} requires a minimum purchase of $${discount.minimumPurchase}`,
          })
        }

        if (!discount.isCombinable && appliedDiscounts.length > 0) {
          return response.badRequest({
            error: `Discount ${discount.name} is not combinable with other discounts.`,
          })
        }

        let currentDiscountAmount = 0
        if (discount.type === 'percentage') {
          currentDiscountAmount = (totalAmount * discount.amount) / 100
        } else if (discount.type === 'fixed') {
          currentDiscountAmount = discount.amount
        }

        appliedDiscounts.push({
          discountId: discount.id,
          scope: discount.scope,
          applied_amount: currentDiscountAmount,
        })

        discountAmount += currentDiscountAmount
        totalAmount -= currentDiscountAmount
        totalAmount = Math.max(0, totalAmount)
      }

      // Création de la commande
      const order = await Order.create({
        userId: user.id,
        totalAmount,
        status: totalAmount === 0 ? 'completed' : 'pending',
        currency,
      })

      for (const discount of appliedDiscounts) {
        await order.related('discounts').attach({
          [discount.discountId]: {
            scope: discount.scope,
            applied_amount: discount.applied_amount,
          },
        })
      }
      await OrderItem.createMany(
        orderItems.map((item) => ({
          ...item,
          orderId: order.id,
        }))
      )

      await this.handlePayment(order, user, paymentMethodId, returnUrl)

      if (hasSubscriptionProduct) {
        await this.handleSubscription(order, user, items, isMonthly)
      }

      await order.load('items', (itemQuery) => {
        itemQuery.preload('product')
      })
      await order.load('discounts')

      const orderInvoiceHtml = await view.render('emails/orders/order_invoice', {
        invoiceNumber: order.id,
        username: user.username,
        products: items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          totalPrice: item.totalAmount,
        })),
        discounts: order.discounts,
        total: order.totalAmount,
        purchaseDate: order.createdAt.toFormat('yyyy-MM-dd HH:mm'),
      });

      await order.createInvoice(orderInvoiceHtml)
      const logoPathSigned = await Asset.signedUrl('coffeeStream.png', '1h')


      await mail.send((message) => {
        message
          .to(user.email)
          .from('dev@yannickperret.com')
          .subject(`${env.get('NAME')} - Your Order Confirmation`)
          .htmlView('emails/orders/order_confirmation', {
            order: order,
            user: user,
            logo: logoPathSigned,
            products: order.items.map((item) => ({
              signedLogoPath: item.product.logoPathSigned,
              title: item.product.title,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              annualPrice: item.product.annualPrice,
              monthlyPrice: item.product.monthlyPrice,
              totalPrice: item.totalAmount,
              frequency: item.frequency,
              price: item.product.price,
              directDiscount: item.product.directDiscount,
            })),
            discounts: order.discounts,
            orderUrl: `${env.get('FRONTEND_URL')}/orders/${order.slug}`,
            purchaseDate: order.createdAt.toFormat('yyyy-MM-dd HH:mm'),
          })
      })

      return response.json({ success: true, order })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: error.message })
    }
  }

  async show({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    if (!user) return response.badRequest()

    try {
      const order = await Order.query()
        .where('userId', user.id)
        .where('id', params.id)
        .preload('items', (itemQuery) => {
          itemQuery.preload('product')
        })
        .preload('discount')
        .firstOrFail()

      return response.json({ success: true, order })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: error.message })
    }
  }

  async downloadInvoice({ params, response, auth, view }: HttpContext) {
    const user = auth.getUserOrFail()

    try {
      const order = await Order.query()
        .where('userId', user.id)
        .where('slug', params.slug)
        .preload('user')
        .preload('items', (itemQuery) => {
          itemQuery.preload('product');
        })
        .preload('discounts')
        .firstOrFail()

      const orderInvoiceHtml = await view.render('emails/orders/order_invoice', {
        invoiceNumber: order.id,
        username: user.username,
        products: order.items.map((item) => ({
          title: item.product.title,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          totalPrice: item.totalAmount,
        })),
        discounts: order.discounts,
        total: order.totalAmount,
        purchaseDate: order.createdAt.toFormat('yyyy-MM-dd HH:mm'),
      });

      const htmlFilePath = app.publicPath(`invoice_${order.slug}.html`);
      const pdfFilePath = app.publicPath(
        'Invoice_' + order.slug + '_' + DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss') + '.pdf'
      );

      // Appeler la méthode statique correctement
      const invoicePDF = await InvoiceService.createInvoice({
        filepath: htmlFilePath,
        content: orderInvoiceHtml,
        finalPath: pdfFilePath,
      });

      return response.download(invoicePDF);
    } catch (error) {
      console.error(error)
      return response.status(500).json({error: error.message})
    }
  }

  async showBySlug({ params, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    try {
      const order = await Order.query()
        .where('userId', user.id)
        .where('slug', params.slug)
        .preload('items', (itemQuery) => {
          itemQuery.preload('product')
        })
        .preload('discounts')
        .firstOrFail()

      return response.json(order)
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: error.message })
    }
  }

  async renewSubscription({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const {
      orderId,
      firstName,
      lastName,
      phone,
      items,
      paymentMethodId,
      returnUrl,
      address,
      discounts,
    } = request.only([
      'orderId',
      'firstName',
      'lastName',
      'phone',
      'items',
      'paymentMethodId',
      'returnUrl',
      'address',
      'discounts',
    ])
    try {
      await UserAddress.firstOrCreate(
        { address: address.line1 },
        {
          userId: user.id,
          firstName,
          lastName,
          phone,
          address: address.line1,
          city: address.city,
          state: address.state,
          zip: address.postal_code,
          country: address.country,
        }
      )

      const order = await Order.findOrFail(orderId)

      if (order.status === 'completed') {
        return response.badRequest({ error: 'This order has already been completed.' })
      }

      const product = await Product.findOrFail(items[0].productId)
      await this.handlePayment(order, user, paymentMethodId, returnUrl)
      await this.handleSubscription(order, user, [{ productId: product.id, quantity: 1 }], true)

      return response.json({ success: true, order })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: error.message })
    }
  }

  private async handlePayment(order, user, paymentMethodId, returnUrl) {
    if (order.totalAmount === 0) {
      order.status = 'completed'
      await order.save()
      return
    }

    const paymentGateway = PaymentFactory.getProvider('stripe')

    const paymentIntent = await paymentGateway.createPayment(order, user, {
      paymentMethodId,
      returnUrl,
    })

    if (paymentIntent.status === 'succeeded') {
      order.status = 'completed'
      await order.save()
    }
  }

  private async handleSubscription(order, user, items, isMonthly) {
    for (const item of items) {
      const product = await Product.findOrFail(item.productId);

      let subscription = await Subscription.query()
        .where('productId', product.id)
        .andWhere('userId', user.id)
        .first();

      if (product.purchaseType === 'subscription') {
        let newExpiresAt: DateTime;

        if (subscription) {
          newExpiresAt = isMonthly
            ? subscription.expiresAt.plus({ months: 1 })
            : subscription.expiresAt.plus({ years: 1 })

          await Subscription.updateOrCreate(
            {id: subscription.id},
            {
              userId: user.id,
              productId: product.id,
              orderId: order.id,
              status: 'active',
              expiresAt: newExpiresAt,
              frequency: isMonthly ? 'monthly' : 'yearly',
              nextBillingDate: newExpiresAt,
            }
          );
        } else {
          newExpiresAt = isMonthly
            ? DateTime.now().plus({ months: 1 })
            : DateTime.now().plus({ years: 1 });

          await Subscription.create({
            userId: user.id,
            productId: product.id,
            orderId: order.id,
            status: 'active',
            expiresAt: newExpiresAt,
            frequency: isMonthly ? 'monthly' : 'yearly',
            nextBillingDate: newExpiresAt,
          });
        }
      }
    }
  }
}
