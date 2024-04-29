import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/User'

export default class SessionController {

  async store({ request }: HttpContext) {
    const { email, password} = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)

    return user
  }
}
