import type { HttpContext } from '@adonisjs/core/http'
import Provider from '#models/providers/provider'
import { providerValidator } from '#validators/provider'

export default class ProvidersController {
  /**
   * Display a list of resource
   */
  async index({ auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const providers = await Provider.findManyBy('user_id', user.id)
    return response.json(providers)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, auth }: HttpContext) {
    console.log('lol')
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
      userId: user.id,
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
  async show({ params, response }: HttpContext) {
    const provider = await Provider.findOrFail(params.id)
    await provider.load('user')
    return response.json(provider)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, auth }: HttpContext) {
    await auth.authenticate()
    const provider = await Provider.findOrFail(params.id)
    const {
      name,
      type,
      clientId,
      clientSecret,
      refreshToken,
      broadcasterId,
      authBearer,
      streamKey,
    } = request.only([
      'name',
      'type',
      'clientId',
      'clientSecret',
      'refreshToken',
      'broadcasterId',
      'authBearer',
      'streamKey',
    ])

    await request.validateUsing(providerValidator)

    provider.name = name
    provider.type = type
    provider.clientId = clientId
    provider.clientSecret = clientSecret
    provider.refreshToken = refreshToken
    provider.broadcasterId = broadcasterId
    provider.authBearer = authBearer
    provider.streamKey = streamKey

    const updated = await provider.save()
    await updated.load('user')
    if (updated) {
      return response.ok(updated)
    } else {
      return response.badRequest({ error: 'Failed to update provider' })
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const provider = await Provider.findOrFail(params.id)
    if (provider.userId !== user.id) {
      return response.forbidden('You are not authorized to delete this provider')
    }
    await provider.delete()
    return response.noContent()
  }
}
