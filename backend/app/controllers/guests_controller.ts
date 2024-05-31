import type { HttpContext } from '@adonisjs/core/http'
import Video from '#models/video'
import Guest from '#models/guest'
import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { cuid } from '@adonisjs/core/helpers'
import * as fs from 'node:fs'
import { DateTime } from 'luxon'
import GuestToken from '#models/guest_token'
import mail from '@adonisjs/mail/services/main'

export default class GuestsController {
  /**
   * Display a list of resource
   */
  async index({ auth, response }: HttpContext) {
    await auth.authenticate()
    const guests = await Guest.all()
    return response.json(guests)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth, response }: HttpContext) {
    await auth.authenticate()

    const {
      email,
      displayName,
      discordUsername,
      steamUsername,
      twitchUsername,
      twitterUsername,
      youtubeUsername,
      telegramUsername,
    } = request.only([
      'email',
      'displayName',
      'discordUsername',
      'steamUsername',
      'twitchUsername',
      'twitterUsername',
      'youtubeUsername',
      'telegramUsername',
    ])

    const guest = await Guest.firstOrCreate(
      { email },
      {
        email,
        displayName,
        discordUsername,
        steamUsername,
        twitchUsername,
        twitterUsername,
        youtubeUsername,
        telegramUsername,
      }
    )

    return response.created(guest)
  }

  /**
   * Show individual record
   */
  async show({ params, response, auth }: HttpContext) {
    await auth.authenticate()
    const guest = await Guest.findOrFail(params.id)
    return response.json(guest)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth, response }: HttpContext) {
    await auth.authenticate()
    const guest = await Guest.findOrFail(params.id)
    const updated = await guest.merge(request.all()).save()

    if (!updated) {
      return response.internalServerError('Error updating guest')
    }
    return response.json(updated)
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    const guest = await Guest.findOrFail(params.id)
    await guest.delete()
    return response.noContent()
  }

  /**
   * Upload video
   * @param request
   * @param response
   */

  async upload({ request, response }: HttpContext) {
    const {
      title,
      description,
      displayName,
      email,
      discordUsername,
      twitchUsername,
      steamUsername,
      twitterUsername,
      youtubeUsername,
      telegramUsername,
    } = request.only([
      'title',
      'description',
      'displayName',
      'email',
      'discordUsername',
      'twitchUsername',
      'steamUsername',
      'twitterUsername',
      'youtubeUsername',
      'telegramUsername',
    ])

    const videoFile = request.file('video', {
      extnames: ['mp4', 'avi', 'mov', 'mkv', 'webm'],
      size: '20gb',
    })

    if (!videoFile) {
      return response.badRequest('No video uploaded')
    }

    if (videoFile.hasErrors) {
      return response.badRequest(videoFile.errors)
    }

    const ipAddress = request.ip()

    const guest = await Guest.firstOrCreate(
      { email },
      {
        displayName,
        ipAddress,
        email,
        discordUsername,
        twitchUsername,
        steamUsername,
        twitterUsername,
        youtubeUsername,
        telegramUsername,
        canDiffuse: 1,
      }
    )

    if (Number(guest.canDiffuse) !== 1) {
      fs.unlinkSync(videoFile.tmpPath as string)
      return response.forbidden('Guest cannot diffuse')
    }

    const token = crypto.randomUUID()
    const expiresAt = DateTime.now().plus({ minutes: 15 })

    await videoFile.move(app.makePath(env.get('VIDEO_GUEST_PENDING_DIRECTORY')), {
      name: `${cuid()}.${videoFile.extname}`,
    })

    const videoCreated = await Video.create({
      title,
      description,
      path: videoFile.filePath as string,
      duration: await Video.getDuration(videoFile.filePath as string),
      showInLive: true,
      status: 'unpublished',
      guestId: guest.id,
    })

    mail.use('resend')

    await mail.send((message) => {
      message
        .to(email)
        .from('noreply@beyondspeedrun.com')
        .subject('Video Upload Verification')
        .htmlView('emails/verify_guest', {
          guest,
          token,
          FRONTEND_URL: env.get('FRONTEND_URL'),
        })
    })

    await GuestToken.create({
      guestId: guest.id,
      videoId: videoCreated.id,
      token,
      expiresAt,
      status: 'sended',
    })

    if (!videoCreated) {
      return response.internalServerError('Error creating video')
    }

    return response.created(videoCreated)
  }

  async validateToken({ response, params }: HttpContext) {
    const { token } = params

    const verificationToken = await GuestToken.query()
      .where('token', token)
      .where('expires_at', '>', DateTime.now().toSQL())
      .where('status', 'sended')
      .first()

    if (!verificationToken) {
      const guestToken = await GuestToken.query().where('token', token).first()
      if (guestToken?.status === 'validated') {
        return response.badRequest('Token already validated')
      }

      if (guestToken) {
        guestToken.status = 'invalidated'
        await guestToken.save()

        const video = await Video.find(guestToken.videoId)
        if (video) {
          fs.unlinkSync(video.path)
          await video.delete()
        }
      }

      return response.badRequest('Invalid or expired token')
    }

    const video = await Video.findOrFail(verificationToken.videoId)
    video.status = 'pending'
    await video.save()

    verificationToken.status = 'validated'
    await verificationToken.save()

    return response.ok('Video verified successfully')
  }
}
