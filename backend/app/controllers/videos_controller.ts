import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import Video from '#models/video'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import Queue from '#models/queue'
import * as fs from 'node:fs'

export default class VideosController {
  /**
   * Display a list of resource
   */
  async index({ auth, response, request }: HttpContext) {
    const user = await auth.authenticate()
    const filters: { [key: string]: any } = request.only(['status', 'userId'])
    let query = Video.query().preload('user').preload('guest')

    if (Object.keys(filters).length === 0) {
      query = query.where('userId', user.id).orWhereNotNull('guestId')
    } else {
      for (let key in filters) {
        if (filters[key]) {
          logger.info(`Filtering by ${key} = ${filters[key]}`)
          query = query.where(key, filters[key])
        }
      }
    }

    const videos = await query
    return response.json(videos)
  }

  /**
   * Handle form submission for the create action
   */

  async store({ request, auth, response }: HttpContext) {
    const user = await auth.authenticate()

    const { title, description, isPublished, showInLive } = request.only([
      'title',
      'description',
      'isPublished',
      'showInLive',
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
    const videoCreated = await Video.create({
      title,
      description,
      path: videoFile.tmpPath,
      duration: await Video.getDuration(videoFile.tmpPath as string),
      showInLive,
      status: isPublished ? 'published' : 'unpublished',
      userId: user.id,
    })

    if (await videoCreated.requiresEncoding()) {
      await videoFile.move(app.makePath(env.get('VIDEO_PROCESSING_DIRECTORY')), {
        name: `${cuid()}.${videoFile.extname}`,
      })
      videoCreated.path = videoFile.filePath as string
      logger.info('Video is not in the correct format, encoding it')

      await videoCreated.save()

      const queue = Queue.getInstance()
      await queue.add(videoCreated, null, null).then(async (outputPath) => {
        logger.info('Encoding completed')
        videoCreated.path = outputPath

        await videoCreated.save()
      })
    } else {
      await videoFile.move(app.makePath(env.get('VIDEO_DIRECTORY')), {
        name: `${cuid()}.${videoFile.extname}`,
      })
      videoCreated.path = videoFile.filePath as string
      await videoCreated.save()
    }

    return response.created(videoCreated)
  }

  /**
   * Show individual record
   */
  async show({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const video = await Video.findOrFail(params.id)
    if (video.userId !== user.id) {
      return response.forbidden('You are not authorized to view this video')
    }
    await video.load('user')
    await video.load('guest')
    return response.json(video)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    if (!user.id) {
      return response.forbidden('You are not authorized to update this video')
    }
    const video = await Video.findOrFail(params.id)

    const { title, description, showInLive, status } = request.only([
      'title',
      'description',
      'showInLive',
      'status',
    ])

    video.title = title
    video.description = description
    video.status = status
    video.showInLive = showInLive

    await video.save()
    return response.json(video)
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const video = await Video.findOrFail(params.id)
    if (video.userId !== user.id) {
      return response.forbidden('You are not authorized to delete this video')
    }
    // Delete the video file
    fs.unlink(video.path, (err) => {
      if (err) {
        logger.error(err)
      }
    })
    await video.delete()
    return response.status(200)
  }

  async serve({ response, params }: HttpContext) {
    const video = await Video.findOrFail(params.id)
    if (!video) {
      return response.notFound('Video not found')
    }
    return response.download(`${video.path}`)
  }

  async validate({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    if (!user) {
      return response.unauthorized('You are not authorized to validate this video')
    }

    const video = await Video.findOrFail(params.id)

    if (await video.requiresEncoding()) {
      // Move the video to the processing directory
      const newFilePath = app.makePath(
        env.get('VIDEO_PROCESSING_DIRECTORY'),
        `${cuid()}.${video.path.split('.').pop()}`
      )

      fs.rename(video.path, newFilePath, (err) => {
        if (err) {
          logger.error(err)
          return response.internalServerError('Error moving file to processing directory')
        }
      })
      video.path = newFilePath
      await video.save()

      logger.info('Video is not in the correct format, encoding it')

      const queue = Queue.getInstance()
      await queue
        .add(video, null, null)
        .then(async (outputPath) => {
          logger.info('Encoding completed')
          logger.info(`New file path: ${outputPath}`)
          video.path = outputPath
          video.status = 'published'
          await video.save()
        })
        .catch(async (err) => {
          logger.error(err)
          video.status = 'unpublished'
          await video.save()
          return response.internalServerError(err)
        })
    } else {
      const finalPath = app.makePath(
        env.get('VIDEO_DIRECTORY'),
        `${cuid()}.${video.path.split('.').pop()}`
      )
      fs.rename(video.path, finalPath, (err) => {
        if (err) {
          logger.error(err)
          return response.internalServerError('Error moving file to final directory')
        }
      })

      logger.info(`New file path: ${finalPath}`)
      video.path = finalPath
      video.status = 'published'
      await video.save()
    }

    return response.json(video)
  }
}
