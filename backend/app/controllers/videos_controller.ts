import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'
import Video from '#models/video'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import Queue from '#models/queue'
import * as fs from 'node:fs'
import Asset from '#models/asset'
import YtDdownload from '#models/streamsFactory/ytb_download'

export default class VideosController {
  /**
   * Display a list of resource
   */
  async index({ auth, response, request }: HttpContext) {
    const user = await auth.authenticate()
    const filters: { [key: string]: any } = request.only(['status', 'userId'])
    let query = Video.query().preload('user')

    if (Object.keys(filters).length === 0) {
      query = query.where('userId', user.id)
    } else {
      for (let key in filters) {
        if (filters[key]) {
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
    try {
      const user = auth.getUserOrFail()

      let { title, description, fileName, fileType, videoUrl } = request.only([
        'title',
        'description',
        'fileName',
        'fileType',
        'videoUrl',
      ])
      let videoPath: string | string[]
      let status = 'pending'
      let size = 0
      let duration = 0

      if (videoUrl) {
        console.log('YouTube URL detected. Starting download...')
        videoPath = await YtDdownload.download(videoUrl)

        const youtubeInfo = await YtDdownload.getVideoInfo(videoUrl)
        title = youtubeInfo.videoDetails.title
        description = youtubeInfo.videoDetails.description
        duration = youtubeInfo.videoDetails.lengthSeconds
        const metadata = await Asset.getInfo(videoPath)
        size = metadata.contentLength / (1024 * 1024)
        status = 'published'
      } else {
        console.log('No YouTube URL detected. Creating presigned URL...')
        videoPath = await Asset.createPresignedUrl(fileName, fileType)
      }

      const video = await Video.create({
        title,
        description,
        userId: user.id,
        path: videoPath,
        status,
        showInLive: 0,
        duration: duration,
        size,
      })

      return response.created({
        video,
        signedUrl: await Asset.getPublicUrl(videoPath),
      })
    } catch (error) {
      console.error('Error while creating video:', error)
      return response.internalServerError('Could not create video')
    }
  }

  async generateUploadPolicy({ request, response }: HttpContext) {
    try {
      const { fileName, fileType } = request.only(['fileName', 'fileType'])
      const { url, fields } = await Asset.generateS3UploadPolicy(fileName, fileType)

      return response.json({ url, fields })
    } catch (error) {
      console.error('Error generating upload policy:', error)
      return response.internalServerError('Could not generate upload policy')
    }
  }

  /*async store({ request, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      const { title, description, isPublished, showInLive } = request.only([
        'title',
        'description',
        'isPublished',
        'showInLive',
      ])

      const videoFile = request.file('video', {
        extnames: ['mp4', 'avi', 'mov', 'mts', 'webm', 'mkv'],
        size: '2GB',
      })

      if (!videoFile || videoFile.hasErrors) {
        return response.badRequest(videoFile?.errors || 'No video uploaded')
      }

      const newVideo = await Video.create({
        title,
        description,
        path: videoFile.tmpPath,
        duration: await Video.getDuration(videoFile.tmpPath as string),
        showInLive,
        status: isPublished ? 'published' : 'unpublished',
        userId: user.id,
      })

      if (await newVideo.requiresEncoding()) {
        await this.handleEncoding(videoFile, newVideo, user)
      } else {
        await this.handleStore(videoFile, newVideo, user)
      }

      return response.created(newVideo)
    } catch (error) {
      logger.error('Error while processing video upload:', error)
      return response.internalServerError('An error occurred while processing the video.')
    }
  }
*/

  async show({ params, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const video = await Video.findOrFail(params.id)
    if (video.userId && video.userId !== user.id) {
      return response.forbidden('You are not authorized to view this video')
    }
    await video.load('user')
    return response.json(video)
  }

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
    await video.load('user')

    return response.json(video)
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const video = await Video.findOrFail(params.id)
    if (video.user && video.user.id !== user.id) {
      return response.forbidden('You are not authorized to delete this video')
    }
    try {
      await Asset.deleteFromS3(video.path)
      await video.delete()
    } catch (error) {
      logger.error('Error while deleting video:', error)
    }
    return response.noContent()
  }

  async serve({ response, params }: HttpContext) {
    const video = await Video.findOrFail(params.id)
    if (!video) {
      return response.notFound('Video not found')
    }
    return response.download(`${video.path}`)
  }

  private async moveFile(videoFile, destinationDir) {
    await videoFile.move(app.publicPath(destinationDir), {
      name: `${cuid()}.${videoFile.extname}`,
    })
    return videoFile.filePath
  }

  private async safeDeleteFile(filePath: string) {
    try {
      logger.info(`Attempting to delete file: ${filePath}`)
      await fs.unlink(filePath)
      logger.info(`Successfully deleted file: ${filePath}`)
    } catch (error) {
      logger.error('Failed to delete file', error)
    }
  }
}
