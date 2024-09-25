import type { HttpContext } from '@adonisjs/core/http'
import Stream from '#models/stream'
import Stream_manager from '#models/stream_manager'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import env from '#start/env'
import {
  StreamResolutionByQuality,
  StreamQualityBiterate,
  StreamFpsByQuality,
} from '#enums/streams'

export default class StreamsController {
  async index({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const streams = await Stream.query()
      .where('userId', user.id)
      .preload('timeline')
      .preload('provider')

    const streamWithCurrentVideo = await Promise.all(
      streams.map(async (stream) => {
        const currentVideo =
          stream.status === 'active'
            ? await stream.timeline.getCurrentVideo(stream.currentIndex)
            : null
        return {
          ...stream.serialize(),
          currentVideo: currentVideo ? currentVideo.serialize() : null,
        }
      })
    )

    return response.json(streamWithCurrentVideo)
  }

  async show({ params, response }: HttpContext) {
    const stream = await Stream.query()
      .preload('provider')
      .preload('timeline')
      .preload('user')
      .where('id', params.id)
      .firstOrFail()

    const currentVideo =
      stream.status === 'active' ? await stream.timeline.getCurrentVideo(stream.currentIndex) : null

    return response.json({
      ...stream.serialize(),
      currentVideo: currentVideo ? currentVideo.serialize() : null,
    })
  }

  async start({ params, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const stream = await Stream.query()
      .where('id', params.id)
      .andWhere('userId', user.id)
      .firstOrFail()

    const streamManager = Stream_manager
    const streamInstance = await streamManager.getOrAddStream(params.id, stream)

    if (!stream) {
      return response.notFound({ error: 'Stream not found' })
    }

    await streamInstance.run()
    return response.ok({ message: 'Stream started' })
  }

  async stop({ params, response }: HttpContext) {
    const streamManager = Stream_manager
    const streamDb = await Stream.find(params.id)

    if (!streamDb) {
      return response.notFound({ error: 'Stream not found' })
    }

    const stream = await streamManager.getOrAddStream(params.id, streamDb)

    await stream.stop()
    streamManager.removeStream(params.id)
    return response.ok({ message: 'Stream stopped' })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { title, timeline, quality, websiteUrl, provider } = request.only([
      'title',
      'timeline',
      'quality',
      'websiteUrl',
      'provider',
    ])
    const runLive = request.input('runLive') === 'true'

    const logoFile = request.file('logo', { size: '5mb', extnames: ['jpg', 'png', 'jpeg'] })
    const overlayFile = request.file('overlay', { size: '50mb', extnames: ['jpg', 'png', 'jpeg'] })

    if (!title || !provider || !timeline || !quality) {
      return response.badRequest({ error: 'Missing required fields' })
    }
    if (websiteUrl !== '' && websiteUrl !== null) {
      // Validate that the website URL matches the allowed patterns
      const allowedUrlPattern =
        /^(https:\/\/dashboard\.twitch\.tv\/widgets\/|https:\/\/streamlabs\.com\/alert-box\/|https:\/\/streamelements\.com\/overlay\/|https:\/\/widgets\.streamelements\.com\/host\/).*/
      if (!allowedUrlPattern.test(websiteUrl)) {
        return response.badRequest({
          error:
            'Invalid website URL. The URL must start with one of the following: https://dashboard.twitch.tv/widgets/, https://streamlabs.com/alert-box/, https://streamelements.com/overlay/, or https://widgets.streamelements.com/host/',
        })
      }
    }

    // 1. Récupérer les souscriptions actives de l'utilisateur
    const subscriptions = await user.related('subscriptions').query().where('status', 'active')

    if (subscriptions.length === 0) {
      return response.forbidden({ error: 'You do not have an active subscription' })
    }

    const subscription = subscriptions[0] // Suppose qu'il n'y a qu'une souscription active

    // 2. Récupérer les features de la souscription et les fusionner avec celles du produit
    const features = await subscription.getSubscriptionWithFeatures()

    // 3. Vérifier le nombre de streams actifs par rapport à max_stream_instance
    const maxStreamInstanceFeature = features.find(
      (feature) => feature.name === 'max_stream_instances'
    )
    const maxStreamInstance = Number.parseInt(maxStreamInstanceFeature?.values[0] || '0', 10)

    const activeStreamsCount = await Stream.query().where('userId', user.id).count('* as total')

    if (activeStreamsCount[0].$extras.total >= maxStreamInstance) {
      return response.forbidden({
        error: `You have reached the maximum number of active streams (${maxStreamInstance}).`,
      })
    }

    // 4. Vérifier que la qualité sélectionnée est bien disponible dans les features
    const qualityFeature = features.find((feature) => feature.name === 'quality')
    const availableQualities = qualityFeature?.values || []

    if (!availableQualities.includes(quality)) {
      return response.badRequest({
        error: `The selected quality (${quality}) is not available for your subscription.`,
      })
    }

    // Vérifier le logo et l'overlay
    if (logoFile && logoFile.isValid) {
      await logoFile.move(env.get('LOGO_DIRECTORY'), {
        name: `${cuid()}.${logoFile.extname}`,
      })
    }

    if (overlayFile && overlayFile.isValid) {
      await overlayFile.move(env.get('OVERLAY_DIRECTORY'), {
        name: `${cuid()}.${overlayFile.extname}`,
      })
    }

    const stream = await Stream.create({
      name: title,
      pid: 0,
      status: 'inactive',
      userId: user.id,
      type: 'ffmpeg',
      timelineId: timeline,
      logo: logoFile ? env.get('LOGO_DIRECTORY') + '/' + logoFile.fileName : null,
      overlay: overlayFile ? env.get('OVERLAY_DIRECTORY') + '/' + overlayFile.fileName : null,
      currentIndex: 0,
      enableBrowser: true,
      webpageUrl: websiteUrl,
      resolution: StreamResolutionByQuality[quality as keyof typeof StreamResolutionByQuality],
      bitrate: StreamQualityBiterate[quality as keyof typeof StreamQualityBiterate],
      fps: StreamFpsByQuality[quality as keyof typeof StreamFpsByQuality],
      providerId: provider,
    })

    // Lancer le stream en live si `runLive` est activé
    if (runLive) {
      await stream.load('timeline')
      const streamManager = Stream_manager
      const streamInstance = await streamManager.getOrAddStream(stream.id.toString(), stream)
      await streamInstance.run()
    }

    return response.created(stream)
  }

  async update({ params, request, response }: HttpContext) {
    const { name, timeline, restartTimes } = request.all()
    const { id } = params
    const logoFile = request.file('logo', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    const overlayFile = request.file('overlay', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    const stream = await Stream.findOrFail(id)

    if (logoFile) {
      if (logoFile.isValid) {
        await logoFile.move(app.publicPath(env.get('LOGO_DIRECTORY')), {
          name: `${cuid()}.${logoFile.extname}`,
        })
        stream.logo = env.get('LOGO_DIRECTORY') + '/' + logoFile.fileName
      } else {
        return response.badRequest({ error: 'Invalid logo file' })
      }
    }

    if (overlayFile) {
      if (overlayFile.isValid) {
        await overlayFile.move(app.publicPath(env.get('OVERLAY_DIRECTORY')), {
          name: `${cuid()}.${overlayFile.extname}`,
        })
        stream.overlay = env.get('OVERLAY_DIRECTORY') + '/' + overlayFile.fileName
      } else {
        return response.badRequest({ error: 'Invalid overlay file' })
      }
    }

    stream.name = name
    stream.timelineId = timeline
    stream.restartTimes = restartTimes
    await stream.save()

    await stream.load('timeline')

    const currentVideo =
      stream.status === 'active' ? await stream.timeline.getCurrentVideo(stream.currentIndex) : null

    return response.ok({
      ...stream.serialize(),
      currentVideo: currentVideo ? currentVideo.serialize() : null,
    })
  }

  async destroy({ params, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const stream = await Stream.query()
      .where('id', params.id)
      .andWhere('user_id', user.id)
      .firstOrFail()
    if (stream.status === 'active') {
      return response.badRequest({ error: 'Stream is active' })
    }

    const streamManager = Stream_manager
    if (!stream) {
      return response.notFound({ error: 'Stream not found' })
    }

    await stream.removeAssets()
    streamManager.removeStream(params.id)
    await stream.delete()
    return response.noContent()
  }
}
