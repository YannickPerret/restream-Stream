import type { HttpContext } from '@adonisjs/core/http'
import Video from '#models/video'
import Guest from '#models/guest'
import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { cuid } from '@adonisjs/core/helpers'

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
      username,
      email,
      displayName,
      discordUsername,
      steamUsername,
      twitchUsername,
      twitterUsername,
      youtubeUsername,
      telegramUsername,
    } = request.only([
      'username',
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
      { username },
      {
        username,
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
  async show({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth, response }: HttpContext) {
    await auth.authenticate()

    const guest = await Guest.findOrFail(params.id)
    await guest.merge(request.all()).save()

    return response.json(guest)
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()

    const guest = await Guest.findOrFail(params.id)
    await guest.delete()

    return response.status(204).json(null)
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
      username,
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
      'username',
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

    await videoFile.move(app.makePath(env.get('VIDEO_GUEST_PENDING_DIRECTORY')), {
      name: `${cuid()}.${videoFile.extname}`,
    })

    const guest = await Guest.firstOrCreate(
      { username },
      {
        username,
        displayName,
        email,
        discordUsername,
        twitchUsername,
        steamUsername,
        twitterUsername,
        youtubeUsername,
        telegramUsername,
      }
    )

    const videoCreated = await Video.create({
      title,
      description,
      path: videoFile.filePath as string,
      duration: await Video.getDuration(videoFile.filePath as string),
      showInLive: true,
      status: 'pending',
      guestId: guest.id,
    })

    if (!videoCreated) {
      return response.internalServerError('Error creating video')
    }

    return response.created(videoCreated)
  }
}
