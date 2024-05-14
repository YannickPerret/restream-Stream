import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'

import Video from '#models/video'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'

export default class VideosController {
  /**
   * Display a list of resource
   */
  async index({ auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const videos = await Video.findManyBy('user_id', user.id)
    return response.json(videos)
  }

  /**
   * Handle form submission for the create action
   */

  async store({ request, auth, response }: HttpContext) {
    logger.info('Uploading video')
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

    // await videoFile.move(env.get('VIDEO_DIRECTORY'))

    await videoFile.move(app.makePath(env.get('VIDEO_DIRECTORY')), {
      name: `${cuid()}.${videoFile.extname}`,
    })

    const videoCreated = await Video.create({
      title,
      description,
      path: videoFile.filePath,
      duration: await Video.getDuration(videoFile.filePath as string),
      showInLive,
      isPublished,
      userId: user.id,
    })

    return response.created(videoCreated)
  }
  /*async store({ request, auth, response }: HttpContext) {
    logger.info('Uploading video')
    logger.info(request.all())
    const user = await auth.authenticate()

    const { title, description, isPublished, showInLive } = request.all()
    const video = request.file('video', {
      extnames: ['mp4', 'avi', 'mov', 'mts'],
    })

    if (!video) {
      return response.badRequest('No video uploaded')
    }

    if (video.hasErrors) {
      return response.badRequest(video.errors)
    }

    const duration = await Video.getDuration(video.tmpPath as string)
    const metadata = await Video.getInformation(video.tmpPath as string)

    await video.move(`.${env.get('VIDEO_DIRECTORY')}`)

    const videoCreated = await Video.create({
      title,
      description,
      path: video.filePath,
      duration,
      showInLive: showInLive,
      isPublished: isPublished,
      userId: user.id,
    })

    if (videoCreated) {
      /*if (
        metadata.streams[0].codec_name !== 'h264' ||
        metadata.streams[0].width !== 1920 ||
        metadata.streams[0].height !== 1080 ||
        metadata.streams[0].r_frame_rate !== '60/1' ||
        metadata.streams[1].codec_name !== 'aac' ||
        metadata.streams[1].sample_rate !== 48000
      ) {
        await video.move(`.${env.get('STORE_VIDEO_DIRECTORY')}processings`)

        videoCreated.path = video.filePath
        await videoCreated.save()

        logger.info('Video is not in the correct format, encoding it')
      } else {
        await video.move(`.${env.get('STORE_VIDEO_DIRECTORY')}`)
        videoCreated.path = video.filePath
        await videoCreated.save()
      }
      return response.created(videoCreated)
    } else {
      return response.badRequest({ error: 'Failed to create video' })
    }
  }*/

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

  async serve({ response, params }: HttpContext) {
    const video = await Video.findOrFail(params.id)
    if (!video) {
      return response.notFound('Video not found')
    }
    return response.download(`${video.path}`)
  }
}
