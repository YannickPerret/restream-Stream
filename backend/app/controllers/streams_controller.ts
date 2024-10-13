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
import Provider from '#models/providers/provider'

export default class StreamsController {
  async index({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const streams = await Stream.query()
      .where('userId', user.id)
      .preload('timeline')
      .preload('providers')

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
      .preload('providers')
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
    const user = auth.getUserOrFail();
    const { title, timeline, quality, websiteUrl, providers } = request.only([
      'title',
      'timeline',
      'quality',
      'websiteUrl',
      'providers',
    ]);

    const runLive = request.input('runLive') === 'true';
    let enableBrowser = true;

    const logoFile = request.file('logo', { size: '5mb', extnames: ['jpg', 'png', 'jpeg'] });
    const overlayFile = request.file('overlay', { size: '50mb', extnames: ['jpg', 'png', 'jpeg'] });

    if (!title || !providers || !timeline || !quality) {
      return response.badRequest({ error: 'Missing required fields' });
    }

    if (websiteUrl && websiteUrl.length > 0) {
      if (!/^(https:\/\/dashboard\.twitch\.tv\/widgets\/|https:\/\/streamlabs\.com\/alert-box\/|https:\/\/streamelements\.com\/overlay\/|https:\/\/widgets\.streamelements\.com\/host\/).*/.test(websiteUrl)) {
        return response.badRequest({
          error: 'Invalid website URL. The URL must start with one of the predefined formats.',
        });
      }
    } else {
      enableBrowser = false;
    }

    // Fetch active subscriptions for the user
    const subscriptions = await user.related('subscriptions').query().where('status', 'active');
    if (subscriptions.length === 0) {
      return response.forbidden({ error: 'You do not have an active subscription' });
    }

    const subscription = subscriptions[0];
    const features = await subscription.getSubscriptionWithFeatures();

    const maxStreamInstanceFeature = features.find((feature) => feature.name === 'max_stream_instances');
    const maxStreamChannelFeature = features.find((feature) => feature.name === 'max_multi_stream_channel')?.values[0];
    const maxStreamInstance = Number.parseInt(maxStreamInstanceFeature?.values[0] || '0', 10);

    const activeStreamsCount = await Stream.query().where('userId', user.id).count('* as total');
    if (activeStreamsCount[0].$extras.total >= maxStreamInstance) {
      return response.forbidden({
        error: `You have reached the maximum number of active streams (${maxStreamInstance}).`,
      });
    }

    const qualityFeature = features.find((feature) => feature.name === 'quality');
    const availableQualities = qualityFeature?.values || [];
    if (!availableQualities.includes(quality)) {
      return response.badRequest({
        error: `The selected quality (${quality}) is not available for your subscription.`,
      });
    }

    // Ensure providers belong to the user and exist in the database
    const validProviders = [];
    for (const providerId of providers) {
      console.log(providerId);
      const provider = await Provider.query()
        .where('id', providerId)
        .andWhere('user_id', user.id)
        .first();

      if (!provider) {
        return response.badRequest({ error: `Provider with ID ${providerId} does not exist or you do not have access.` });
      }

      validProviders.push(provider.id);
    }

    if (validProviders.length >= maxStreamChannelFeature) {
      return response.forbidden({
        error: `You have reached the maximum number of channels (${maxStreamChannelFeature}). Please upgrade your subscription to add more channels.`,
      });
    }

    // Handle file uploads (logo and overlay)
    let logoPath = null;
    let overlayPath = null;

    if (logoFile && logoFile.isValid) {
      const logoFileName = `${cuid()}.${logoFile.extname}`;
      await logoFile.move(env.get('LOGO_DIRECTORY'), { name: logoFileName });
      logoPath = `${env.get('LOGO_DIRECTORY')}/${logoFileName}`;
    }

    if (overlayFile && overlayFile.isValid) {
      const overlayFileName = `${cuid()}.${overlayFile.extname}`;
      await overlayFile.move(env.get('OVERLAY_DIRECTORY'), { name: overlayFileName });
      overlayPath = `${env.get('OVERLAY_DIRECTORY')}/${overlayFileName}`;
    }

    // Create the stream
    const stream = await Stream.create({
      name: title,
      pid: 0,
      status: 'inactive',
      userId: user.id,
      type: 'ffmpeg',
      timelineId: timeline,
      logo: logoPath,
      overlay: overlayPath,
      currentIndex: 0,
      enableBrowser: enableBrowser,
      webpageUrl: websiteUrl,
      resolution: StreamResolutionByQuality[quality as keyof typeof StreamResolutionByQuality],
      bitrate: StreamQualityBiterate[quality as keyof typeof StreamQualityBiterate],
      fps: StreamFpsByQuality[quality as keyof typeof StreamFpsByQuality],
    });

    // Attach providers to the stream (many-to-many relation)
    await stream.related('providers').attach(validProviders);

    // Optionally, start the stream if 'runLive' is true
    if (runLive) {
      await stream.load('timeline');
      const streamManager = Stream_manager;
      const streamInstance = await streamManager.getOrAddStream(stream.id.toString(), stream);
      await streamInstance.run();
    }

    return response.created(stream);
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
