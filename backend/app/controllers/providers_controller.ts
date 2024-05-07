import type { HttpContext } from '@adonisjs/core/http'
import Provider from '#models/provider'
import logger from '@adonisjs/core/services/logger'

export default class ProvidersController {
  /**
   * Display a list of resource
   */
  async index({ auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const providers = await Provider.query().where('user_id', user.id)
    return response.json({ providers })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const {
      name,
      providerType,
      clientId,
      clientSecret,
      refreshToken,
      broadcasterId,
      authToken,
      streamKey,
    } = request.all()

    if (!name || !providerType) {
      return response.badRequest({ error: 'Missing required fields' })
    }
    const provider = await Provider.create({
      name,
      type: providerType,
      clientId,
      clientSecret,
      refreshToken,
      broadcasterId,
      authBearer: authToken,
      streamKey,
      user_id: user.id,
    })

    if (provider) {
      return response.created(provider)
    } else {
      return response.badRequest({ error: 'Failed to create provider' })
    }
  }

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
