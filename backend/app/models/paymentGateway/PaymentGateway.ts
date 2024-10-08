import { BaseModel } from '@adonisjs/lucid/orm'
import Order from '#models/order'
import User from '#models/user'
import Product from '#models/product'
import StripePaymentProvider from '#models/paymentGateway/StripePaymentProvider'

interface PaymentProvider {
  createPayment(order: Order, user: User, paymentDetails: any): Promise<any>
  createSubscription(order: Order, user: User, product: Product, paymentDetails: any): Promise<any>;
  cancelSubscription(subscriptionId: string): Promise<any>;
  getSubscriptionInformation(subscriptionId: string): Promise<any>;
  setupProduct(product: Product): Promise<any>
  removeProduct(product: Product): Promise<void>
  getPaymentInformation(paymentId: string): Promise<any>
  getSubscriptionInformation(subscriptionId: string): Promise<any>
}

export default class PaymentFactory extends BaseModel {
  static getProvider(providerName: string): PaymentProvider {
    switch (providerName) {
      case 'stripe':
        return new StripePaymentProvider()
      default:
        throw new Error(`Unknown payment provider: ${providerName}`)
    }
  }
}
