import type { HttpContext } from '@adonisjs/core/http'
import FFMPEGStream from '#models/ffmpeg'

export default class StreamsController {
  async startStream({request, response, params}: HttpContext) {
    const {
      channels,
      timelinePath,
      logo,
      overlay,
      guestFile,
      enableBrowser,
      webpageUrl,
      bitrate,
      resolution,
      fps,
    } = request.all()

    const stream = new FFMPEGStream(
      channels,
      timelinePath,
      logo,
      overlay,
      guestFile,
      enableBrowser,
      webpageUrl,
      bitrate,
      resolution,
      fps
    )

    stream.startStream((bitrate) => {
      response.json({bitrate})
    })
  }

  async stopStream({response, params}: HttpContext) {
    const {id} = params

    FFMPEGStream.stopStream(parseInt(id))

    response.json({message: 'Stream stopped'})
  }

  async restartStream({request, response, params}: HttpContext) {
    const {id} = params

    FFMPEGStream.restartStream(parseInt(id))

    response.json({message: 'Stream restarted'})
  }
}
