import Stripe from 'stripe'
import env from '#start/env'
import Order from '#models/order'
import Product from '#models/product'
import User from '#models/user'
import Payment from '#models/payment'

interface PaymentProvider {
  createPayment(order: Order, user: User, paymentDetails: any): Promise<any>
  createSubscription(order: Order, user: User, product: Product, paymentDetails: any): Promise<any>
  cancelSubscription(subscriptionId: string): Promise<any>
  getSubscriptionInformation(subscriptionId: string): Promise<any>
  setupProduct(product: Product): Promise<any>
  removeProduct(product: Product): Promise<void>
  getPaymentInformation(paymentId: string): Promise<any>
  getSubscriptionInformation(subscriptionId: string): Promise<any>
}

export default class StripePaymentProvider implements PaymentProvider {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(env.get('STRIPE_KEY_PRIVATE'), {
      apiVersion: '2024-06-20',
    })
  }

  async createPayment(order: Order, user: User, paymentDetails: any) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100),
        currency: order.currency || 'usd',
        payment_method: paymentDetails.paymentMethodId,
        confirm: true,
        return_url: paymentDetails.returnUrl,
        metadata: {
          order_id: order.id,
          user_id: user.id,
        },
      })

      await Payment.recordPayment(
        order,
        user,
        'stripe',
        paymentIntent.id,
        order.totalAmount,
        order.currency,
        paymentIntent.status
      )

      return paymentIntent
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw new Error('Unable to create payment intent')
    }
  }

  async createSubscription(order: Order, user: User, product: Product, paymentDetails: any) {
    try {
      const stripeCustomer = await this.stripe.customers.create({
        email: user.email,
        payment_method: paymentDetails.paymentMethodId,
        invoice_settings: { default_payment_method: paymentDetails.paymentMethodId },
        metadata: {
          user_id: user.id,
        },
      })

      const stripeProducts = await this.getProductByMetaData([{ index: 'productId', value: product.id }]);

      if (stripeProducts.length === 0) {
        throw new Error(`No Stripe product found with productId: ${product.id}`);
      }

      const stripeProduct = stripeProducts[0];

      const stripePrices = await this.stripe.prices.list({
        product: stripeProduct.id, // Utiliser l'ID du produit Stripe récupéré
        active: true,
      });

      const selectedPrice = stripePrices.data.find((price) =>
        paymentDetails.isMonthly ? price.recurring?.interval === 'month' : price.recurring?.interval === 'year'
      );

      if (!selectedPrice) {
        throw new Error('No matching price found for the subscription');
      }

      const appliedDiscounts = paymentDetails.discounts
        ? {
            coupon: paymentDetails.discounts[0],
          }
        : {}

      // Créer l'abonnement avec les remises (coupons) s'ils existent
      const subscription = await this.stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [{ price: selectedPrice.id }],
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          order_id: order.id,
          user_id: user.id,
          product_id: product.id,
        },
        ...appliedDiscounts, // Applique les coupons ici
      })

      const paymentIntent = subscription.latest_invoice?.payment_intent

      // Enregistrer le paiement dans la base de données
      await Payment.recordPayment(
        order,
        user,
        'stripe',
        subscription.id,
        product[`${paymentDetails.isMonthly ? 'monthlyPrice' : 'annualPrice'}`],
        order.currency,
        subscription.status
      )

      return subscription
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw new Error('Unable to create subscription')
    }
  }

  async setupProduct(product: Product) {
    const stripeProduct = await this.stripe.products.create({
      name: product.title,
      metadata: {
        productId: product.id,
      },
    })

    const stripeMonthlyPrice = await this.stripe.prices.create({
      unit_amount: Math.round(product.monthlyPrice * 100),
      currency: 'usd',
      recurring: { interval: 'month' },
      product: stripeProduct.id,
    })

    const stripeAnnualPrice = await this.stripe.prices.create({
      unit_amount: Math.round(product.annualPrice * 100),
      currency: 'usd',
      recurring: { interval: 'year' },
      product: stripeProduct.id,
    })
    return { stripeProduct, stripeMonthlyPrice, stripeAnnualPrice }
  }

  async getProductByMetaData(metaDataPairs: { index: string; value: string | number }[]) {
    try {
      const products = await this.stripe.products.list({
        limit: 10,
        active: true,
        expand: ['data.metadata'],
      });

      const matchingProducts = products.data.filter(product =>
        metaDataPairs.every(pair => product.metadata && product.metadata[pair.index] === pair.value.toString())
      );

      if (matchingProducts.length === 0) {
        throw new Error(`No product found matching the metadata pairs: ${JSON.stringify(metaDataPairs)}`);
      }

      return matchingProducts;
    } catch (error) {
      console.error('Error fetching products by metadata:', error);
      throw new Error('Unable to retrieve products from Stripe');
    }
  }

  async removeProduct(product: Product) {
    try {
      const stripeProduct = await this.getProductByMetaData([{ index: 'productId', value: product.id }]);

      if (stripeProduct) {
        await this.stripe.products.del(stripeProduct[0].id);
      }

    } catch (error: any) {
      if (error.type === 'StripeInvalidRequestError' && error.code === 'resource_missing') {
        console.log(`Product with id ${product.id} does not exist in Stripe, skipping deletion.`);
        return;
      }
      throw new Error('Unable to delete product from Stripe');
    }
  }

  async getPaymentInformation(paymentId: string) {
    return await this.stripe.paymentIntents.retrieve(paymentId)
  }

  async getSubscriptionInformation(subscriptionId: string) {
    return await this.stripe.subscriptions.retrieve(subscriptionId)
  }
}
