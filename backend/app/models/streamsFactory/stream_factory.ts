import { StreamProvider } from '#models/streamsFactory/ffmpeg'
import Ffmpeg from '#models/streamsFactory/ffmpeg'
import Gstreamer from '#models/streamsFactory/gstreamer'

export default class StreamFactory {
  static createProvider(
    type: string,
    baseUrl: string,
    streamKey: string,
    timelinePath: string,
    logo: string,
    overlay: string,
    guestFile: string
  ): StreamProvider {
    console.log(type)
    switch (type) {
      case 'ffmpeg':
        return new Ffmpeg(baseUrl, streamKey, timelinePath, logo, overlay, guestFile)
      case 'gstreamer':
        return new Gstreamer(baseUrl, streamKey, timelinePath, logo, overlay, guestFile)
      default:
        throw new Error(`Unsupported provider type: ${type}`)
    }
  }
}
