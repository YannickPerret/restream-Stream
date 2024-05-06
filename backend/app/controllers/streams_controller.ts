import type { HttpContext } from '@adonisjs/core/http'
import Stream from '#models/stream'
import Stream_manager from '#models/stream_manager'
import stream_manager from '#models/stream_manager'

export default class StreamsController {
  async index({ response, auth }: HttpContext) {
    const streams = await Stream.query().where('userId', auth.user!.id)
    return response.ok({ streams })
  }

  async start({ params, response }: HttpContext) {
    const stream = await Stream.findOrFail(params.id)
    const streamManager = Stream_manager
    const streamInstance = streamManager.getOrCreateStream(params.id, stream)

    if (!stream) {
      return response.notFound({ error: 'Stream not found' })
    }
    await streamInstance.start()
    return response.ok({ message: 'Stream started' })
  }

  async stop({ params, response }: HttpContext) {
    const stream = await Stream.findOrFail(params.id)
    const streamManager = Stream_manager
    const streamInstance = streamManager.getOrCreateStream(params.id, stream)
    if (!stream) {
      return response.notFound({ error: 'Stream not found' })
    }
    await streamInstance.stop()
    stream_manager.removeStream(params.id)
    return response.ok({ message: 'Stream stopped' })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = await auth.authenticate()
    const streamManager = Stream_manager
    const stream = await Stream.create({
      name: request.input('title'),
      pid: 0,
      status: 'inactive',
      startTime: null,
      endTime: null,
      userId: user.id,
      type: request.input('type'),
    })
    streamManager.addStream(stream.id.toString(), stream)
    return response.created(stream)
  }

  async delete({ params, response }: HttpContext) {
    const stream = await Stream.findOrFail(params.id)
    const streamManager = Stream_manager
    if (!stream) {
      return response.notFound({ error: 'Stream not found' })
    }
    streamManager.removeStream(params.id)
    await stream.delete()
    return response.ok({ message: 'Stream deleted' })
  }
}
