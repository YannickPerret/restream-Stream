import type { HttpContext } from '@adonisjs/core/http'
import Newsletter from "#models/newsletter";

export default class NewslettersController {

  async store({ request, response }: HttpContext) {
    const { email } = request.only(['email'])
    if (!email) {
      return response.badRequest({ message: 'email is required' })
    }

    await Newsletter.create({ email })
    return response.ok({ message: 'success' })
  }
}
