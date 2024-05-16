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
  async index({}: HttpContext) {}

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
      extnames: ['mp4', 'avi', 'mov', 'mts'],
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
