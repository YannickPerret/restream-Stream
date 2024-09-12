import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator, registerValidator } from '#validators/auth'
import User from '#models/user'
import Role from '#models/role'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import env from '#start/env'
import UserToken from '#models/user_token'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    if (request.input('password') !== request.input('passwordRetry')) {
      return response.badRequest({ message: 'Passwords do not match' })
    }
    const role = await Role.findBy('name', 'member')
    const user = await User.create({ ...payload, roleId: role?.id, ipAddress: request.ip() })
    if (!user) {
      return response.badRequest({ message: 'Failed to create user' })
    }
    const token = crypto.randomUUID()
    const expiresAt = DateTime.now().plus({ hours: 6 })

    await UserToken.create({
      token,
      expiresAt,
      type: 'account_verification',
      userId: user.id,
    })

    await mail.use('resend').send((message) => {
      message
        .to(user.email)
        .from('noreply@beyondspeedrun.com')
        .subject('Restream - Verify your account')
        .htmlView('emails/verify_user_account', {
          username: user.username,
          token,
          FRONTEND_URL: env.get('FRONTEND_URL'),
        })
    })
    return response.created(user)
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)
    if (!user) {
      return response.badRequest({ message: 'Invalid credentials' })
    }
    if (!user.isVerified) {
      return response.badRequest({ message: 'You cannot login until you verify your account' })
    }
    const token = await User.accessTokens.create(user)
    await user.load('role')

    return response.ok({
      token: token,
      user: user,
    })
  }

  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const token = auth.user?.currentAccessToken.identifier
    if (!token) {
      return response.badRequest({ message: 'Token not found' })
    }
    await User.accessTokens.delete(user, token)
    return response.ok({ message: 'Logged out' })
  }

  async verify({ response, request }: HttpContext) {
    const token = request.input('token')
    if (!token) {
      return response.badRequest('Token is required')
    }
    const userToken = await UserToken.query()
      .where('token', token)
      .andWhere('type', 'account_verification')
      .firstOrFail()
    if (token.expiresAt < DateTime.now()) {
      return response.badRequest('Token expired')
    }
    const user = await User.findOrFail(userToken.userId)
    user.isVerified = true
    await user.save()
    await userToken.delete()
    return response.ok('Account verified successfully')
  }

  async refreshToken({ auth, response }: HttpContext) {
    //const token = await auth.refresh()
    //return response.ok({ token })
  }

  async resetPassword({ request, params, response }: HttpContext) {
    const token = await UserToken.query()
      .where('token', params.token)
      .andWhere('type', 'password_reset')
      .firstOrFail()
    if (token.expiresAt < DateTime.now()) {
      return response.badRequest('Token expired')
    }
    const user = await User.findOrFail(token.userId)
    user.password = request.input('password')
    await user.save()
    await token.delete() // Delete the token after successful reset
    return response.ok('Password reset successfully')
  }

  async currentUser({ response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const subscriptionsWithFeatures = await user.getActiveSubscriptionsWithFeatures();
      await user.load('role')

      return response.json({ user, subscriptions: subscriptionsWithFeatures })
    } catch (error) {
      return response.unauthorized({ error: 'User not found' })
    }
  }
}
