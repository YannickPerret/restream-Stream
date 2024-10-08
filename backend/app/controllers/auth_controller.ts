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
    const role = await Role.findByOrFail('name', 'user')
    const user = await User.create({ ...payload, roleId: role.id, ipAddress: request.ip() })
    if (!user) {
      return response.badRequest({ message: 'Failed to create user' })
    }
    const token = crypto.randomUUID()

    const userToken = await UserToken.create({
      token,
      expiresAt: DateTime.now().plus({ hours: 6 }),
      type: 'account_verification',
      userId: user.id,
      status: 'active',
      ip: request.ip(),
    })

    if (!userToken) {
      return response.badRequest({ message: 'Failed to create user token' })
    }


    await mail.send((message) => {
      message
        .to(user.email)
        .from('dev@yannickperret.com')
        .subject(`${env.get('NAME')} - Verify your new account`)
        .htmlView('emails/users/verify_user_account', {
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

    user.lastLoginAt = DateTime.now()
    user.ipAddress = request.ip()

    await user.save()

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
      .andWhere('status', 'active')
      .firstOrFail()

    if (userToken.ip !== request.ip()) {
      return response.badRequest(
        'You are not allowed to verify this account, use the same device you registered with'
      )
    }

    if (token.expiresAt < DateTime.now()) {
      userToken.status = 'expired'
      await token.save()
      return response.badRequest('Token expired')
    }
    const user = await User.findOrFail(userToken.userId)
    user.isVerified = true
    userToken.status = 'used'
    await user.save()
    await userToken.save()
    return response.ok('Account verified successfully')
  }

  async refreshToken({ auth, response }: HttpContext) {
    //const token = await auth.refresh()
    //return response.ok({ token })
  }

  async forgotPassword({ request, response }: HttpContext) {
    // get user by email if found generate token and send to email
    const user = await User.findByOrFail('email', request.input('email'))
    if (user) {
      // test if user have a active token after 24 hours
      let userToken = await UserToken.query()
        .where('userId', user.id)
        .andWhere('type', 'password_reset')
        .andWhere('status', 'active')
        .andWhere('expiresAt', '>', DateTime.now().toSQL()) // Convertir en chaîne SQL
        .andWhere('createdAt', '>', DateTime.now().minus({ hours: 24 }).toSQL()) // Convertir en chaîne SQL
        .first()

      // If a valid token exists, reject the request
      if (userToken) {
        return response.badRequest(
          'Password reset link already sent to your email. Please check your email or try again in 24 hours.'
        )
      }

      const token = crypto.randomUUID()
      userToken = await UserToken.create({
        token,
        expiresAt: DateTime.now().plus({ hours: 6 }),
        type: 'password_reset',
        userId: user.id,
        status: 'active',
        ip: request.ip(),
      })
      if (userToken) {
        await mail.send((message) => {
          message
            .to(user.email)
            .from(`${env.get('SMTP_USERNAME')}`)
            .to(user.email)
            .subject(`${env.get('NAME')} - Reset your password`)
            .htmlView('emails/users/reset_password_user', {
              username: user.username,
              token,
              FRONTEND_URL: env.get('FRONTEND_URL'),
            })
        })
      }
    }
    response.ok('Password reset link sent to your email')
  }

  async resetPassword({ request, response }: HttpContext) {
    const { token, password } = request.only(['token', 'password'])
    const tokenUser = await UserToken.findByOrFail('token', token)

    if (tokenUser.ip !== request.ip()) {
      return response.badRequest(
        'You are not allowed to reset this password, use the same device you requested with'
      )
    }
    if (tokenUser.status !== 'active') {
      return response.badRequest('Invalid token')
    }
    if (tokenUser.expiresAt < DateTime.now()) {
      tokenUser.status = 'expired'
      return response.badRequest('Token expired')
    }
    if (tokenUser.type !== 'password_reset') {
      return response.badRequest('Invalid token')
    }

    const user = await User.findOrFail(tokenUser.userId)
    user.password = password

    await user.save()
    tokenUser.status = 'used'
    await tokenUser.save()

    await mail.send((message) => {
      message
        .to(user.email)
        .from(`${env.get('SMTP_USERNAME')}`)
        .to(user.email)
        .subject(`${env.get('NAME')} - Password reset successful`)
        .htmlView('emails/users/password_reset_successful', {
          username: user.username,
        })
    })

    return response.ok('Password reset successfully')
  }

  async currentUser({ response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const subscriptionsWithFeatures = await user.getActiveSubscriptionsWithFeatures()
      await user.load('role')

      return response.json({ user, subscriptions: subscriptionsWithFeatures })
    } catch (error) {
      return response.unauthorized({ error: 'User not found' })
    }
  }
}
