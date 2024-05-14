import type { HttpContext } from '@adonisjs/core/http'
import Playlist from '#models/playlist'
import logger from '@adonisjs/core/services/logger'
import Video from '#models/video'

export default class PlaylistsController {
  /**
   * Display a list of resource
   */
  async index({ response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const playlists = await Playlist.query().preload('videos').where('userId', user.id)
    return response.json(playlists)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()

    logger.info(request.all())
    const { title, description, videos, isPublished } = request.all()

    const playlist = await Playlist.create({
      title,
      description,
      isPublished,
      userId: user.id,
    })

    if (videos && videos.length > 0) {
      for (const [index, video_] of videos.entries()) {
        const videoDb = await Video.find(video_.id)

        if (videoDb) {
          await playlist.related('videos').attach({
            [videoDb.id]: {
              order: index + 1,
            },
          })
        } else {
          logger.warn(`Video not found: ${videos[index].id}`)
        }
      }
    }

    return response.created(playlist)
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
