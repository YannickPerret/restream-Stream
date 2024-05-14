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
    const playlists = await Playlist.findManyBy('user_id', user.id)
    return response.json(playlists)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const { title, description, videos, isPublished } = request.all()

    const playlist = await Playlist.create({
      title,
      description,
      isPublished: isPublished,
      userId: user.id,
    })

    if (videos) {
      for (const [index, videoId] of videos.entries()) {
        const video = await Video.find(videoId)

        if (video) {
          await playlist.related('videos').attach({
            [videoId]: {
              order: index + 1,
            },
          })
        } else {
          logger.warn(`Video not found: ${videoId}`)
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
