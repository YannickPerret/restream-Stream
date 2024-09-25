import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'

export default class SubscriptionAdminsController {
  /**
   * Display a list of resource
   */
  async index({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    await user.load('role')
    if (!user.role.name === 'admin') {
      response.badRequest("Can't have access")
    }
    const subscriptions = await Subscription.query().preload('product').preload('user')

    console.log(subscriptions)
    return response.json(subscriptions)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {}

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}
