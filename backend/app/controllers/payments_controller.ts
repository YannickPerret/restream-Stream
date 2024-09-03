 import type { HttpContext } from '@adonisjs/core/http'
import Stripe from 'stripe'
 import env from "#start/env";
 import Payment from "#models/payment";

const stripe = new Stripe(env.get('STRIPE_KEY_PRIVATE'), {
  apiVersion: '2024-06-20',
})

export default class PaymentsController {
  public async createPaymentIntent({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    if (!user) return response.badRequest()
    const { amount, currency, paymentMethodId, productId } = request.only(['amount', 'currency', 'paymentMethodId', 'productId'])

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method: paymentMethodId,
        confirm: true,
      })

      const paiement = await Payment.create({
        productId: productId,
        stripePaymentIntentId: paymentIntent.id,
        amount,
        currency,
        status : paymentIntent.status
      })

      return response.json({ success: true, paiement })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: error.message })
    }
  }
}
