import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class UserAdminsController {
  /**
   * Display a list of resource
   */
  async index({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (await user.isAdmin()) {
      const users = await User.query().preload('role')
      return response.json(users)
    } else {
      response.forbidden("Cette page n'existe pas")
    }
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
  async destroy({ response, params, auth }: HttpContext) {
    const myUser = auth.getUserOrFail()
    if (!(await myUser.isAdmin())) {
      return response.forbidden("Vous n'avez pas accès à cette page")
    }
    const user = await User.find(params.id)

    if (!user) {
      return response.notFound({ error: 'User not found' })
    }

    user.deletedAt = DateTime.now()
    await user.save()

    return response.ok({ message: 'User has been soft deleted' })
  }
}
