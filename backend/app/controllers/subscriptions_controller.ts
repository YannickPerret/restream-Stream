import type { HttpContext } from '@adonisjs/core/http'
import Subscription from "#models/subscription";

export default class SubscriptionsController {

  async index({response, auth}: HttpContext) {
    const user = await auth.authenticate(); // Assurez-vous que l'utilisateur est authentifié
    const subscriptions = await Subscription.query()
      .where('userId', user.id)
      .preload('product') // Charge la relation product
      .exec()
    return response.json(subscriptions)
  }

  async create({response, auth}: HttpContext) {

  }
}
