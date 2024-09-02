import type { HttpContext } from '@adonisjs/core/http'
import Stream from '#models/stream'
import Provider from '#models/providers/provider'
import Stream_manager from '#models/stream_manager'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import env from '#start/env'

export default class StreamsController {
  async index({ response, auth }: HttpContext) {
    const streams = await Stream.query()
      .where('userId', auth.user!.id)
      .preload('providers', (query) => {
        query.pivotColumns(['on_primary'])
      })
      .preload('timeline')

    const streamsWithPrimaryProvider = await Promise.all(
      streams.map(async (stream) => {
        const primaryProvider = await stream.getPrimaryProvider()
        const currentVideo =
          stream.status === 'active'
            ? await stream.timeline.getCurrentVideo(stream.currentIndex)
            : null
        return {
          ...stream.serialize(),
          primaryProvider: primaryProvider ? primaryProvider.serialize() : null,
          currentVideo: currentVideo ? currentVideo.serialize() : null,
        }
      })
    )

    return response.json(streamsWithPrimaryProvider)
  }

  async show({ params, response }: HttpContext) {
    const stream = await Stream.query()
      .preload('providers', (query) => {
        query.pivotColumns(['on_primary'])
      })
      .preload('timeline')
      .preload('user')
      .where('id', params.id)
      .firstOrFail()

    const primaryProvider = await stream.getPrimaryProvider()
    const currentVideo =
      stream.status === 'active' ? await stream.timeline.getCurrentVideo(stream.currentIndex) : null

    return response.json({
      ...stream.serialize(),
      primaryProvider: primaryProvider ? primaryProvider.serialize() : null,
      currentVideo: currentVideo ? currentVideo.serialize() : null,
    })
  }

  async start({ params, response }: HttpContext) {
    const stream = await Stream.query()
      .preload('providers', (query) => {
        query.pivotColumns(['on_primary'])
      })
      .preload('timeline')
      .where('id', params.id)
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
    const user = await auth.authenticate()
    const { title, timeline, type } = request.all()
    const runLive = request.input('runLive') === 'true'
    const providersForm = JSON.parse(request.input('providers')) || []
    const logoFile = request.file('logo', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })
    const overlayFile = request.file('overlay', {
      size: '50mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    if (!title || !providersForm || !timeline) {
      return response.badRequest({ error: 'Missing required fields' })
    }

    const providerPromises = providersForm.map((provider: any) => Provider.findOrFail(provider.id))
    await Promise.all(providerPromises)

    const primaryProvider = providersForm.filter((item) => item.onPrimary === true).length

    if (!primaryProvider) {
      return response.badRequest({ error: 'Primary provider is required' })
    } else if (primaryProvider > 1) {
      return response.badRequest({ error: 'Only one primary provider is allowed' })
    }

    if (logoFile && logoFile.isValid) {
      await logoFile.move(app.publicPath(env.get('LOGO_DIRECTORY')), {
        name: `${cuid()}.${logoFile.extname}`,
      })
    }

    if (overlayFile && overlayFile.isValid) {
      await overlayFile.move(app.publicPath(env.get('OVERLAY_DIRECTORY')), {
        name: `${cuid()}.${overlayFile.extname}`,
      })
    }

    const stream = await Stream.create({
      name: title,
      pid: 0,
      status: 'inactive',
      userId: user.id,
      type: type,
      timelineId: timeline,
      logo: logoFile ? env.get('LOGO_DIRECTORY') + '/' + logoFile.fileName : null,
      overlay: overlayFile ? env.get('OVERLAY_DIRECTORY') + '/' + overlayFile.fileName : null,
      currentIndex: 0,
      enableBrowser: true,
      webpageUrl:
        'https://dashboard.twitch.tv/widgets/alertbox#eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGVydF9zZXRfaWQiOiIxOWVkMzhiMC0yZTVjLTRlMTgtYjYyNy1kNDE5MTg5NjdjMzAiLCJ1c2VyX2lkIjoiNDczNzQ5MTgifQ.4xkFoUyJGye34aj4ZrvDTnARV_imT0epWWw08JBD95I',
    })

    console.log(stream)

    if (stream && providersForm) {
      for (const provider of providersForm) {
        await stream.related('providers').attach({
          [provider.id]: {
            on_primary: provider.onPrimary,
          },
        })
      }
    }

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

    await stream.load('providers', (query) => {
      query.pivotColumns(['on_primary'])
    })
    await stream.load('timeline')

    const primaryProvider = await stream.getPrimaryProvider()
    const currentVideo =
      stream.status === 'active' ? await stream.timeline.getCurrentVideo(stream.currentIndex) : null

    return response.ok({
      ...stream.serialize(),
      primaryProvider: primaryProvider ? primaryProvider.serialize() : null,
      currentVideo: currentVideo ? currentVideo.serialize() : null,
    })
  }

  async destroy({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const stream = await Stream.findOrFail(params.id)
    if (stream.status === 'active') {
      return response.badRequest({ error: 'Stream is active' })
    }
    if (stream.userId !== user.id) {
      return response.forbidden('You are not authorized to delete this stream')
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
