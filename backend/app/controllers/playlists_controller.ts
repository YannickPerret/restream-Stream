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
    const { title, description, items, isPublished } = request.all()

    const playlist = await Playlist.create({
      title,
      description,
      isPublished,
      userId: user.id,
    })

    if (items && items.length > 0) {
      for (const [index, video_] of items.entries()) {
        const videoDb = await Video.find(video_.itemId)

        if (videoDb) {
          await playlist.related('videos').attach({
            [videoDb.id]: {
              order: index + 1,
            },
          })
        } else {
          logger.warn(`Video not found: ${items[index].id}`)
        }
      }
    }

    return response.created(playlist)
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    try {
      const playlist = await Playlist.query()
        .where('id', params.id)
        .preload('videos', (videoQuery) => {
          videoQuery.preload('user')
          videoQuery.preload('guest')
        })
        .preload('user')
        .firstOrFail()

      return response.json(playlist)
    } catch (error) {
      logger.error(error)
      return response.status(404).json({ message: 'Playlist not found' })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const playlist = await Playlist.findOrFail(params.id)

    if (playlist.userId !== user.id) {
      return response.forbidden('You are not authorized to update this playlist')
    }

    const updatePlaylist = request.all()

    playlist.title = updatePlaylist.title
    playlist.description = updatePlaylist.description
    playlist.isPublished = updatePlaylist.isPublished

    await playlist.save()

    if (updatePlaylist.videos && updatePlaylist.videos.length > 0) {
      await playlist.related('videos').detach()
      for (const [index, video_] of updatePlaylist.videos.entries()) {
        const videoDb = await Video.find(video_.id)

        if (videoDb) {
          await playlist.related('videos').attach({
            [videoDb.id]: {
              order: index + 1,
            },
          })
        } else {
          logger.warn(`Video not found: ${updatePlaylist.videos[index].id}`)
        }
      }
    }
    return response.json(playlist)
  }

  /**
   * Delete record
   */
  async destroy({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const playlist = await Playlist.findOrFail(params.id)

    if (playlist.userId !== user.id) {
      return response.forbidden('You are not authorized to delete this playlist')
    }

    await playlist.delete()
    return response.noContent()
  }
}
