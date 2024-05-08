import { StreamProvider } from '#models/streamsFactory/ffmpeg'
import Ffmpeg from '#models/streamsFactory/ffmpeg'

export default class StreamFactory {
  static createProvider(type: string, baseUrl: string, streamKey: string): StreamProvider {
    switch (type) {
      case 'ffmpeg':
        return new Ffmpeg(baseUrl, streamKey)
      default:
        throw new Error(`Unsupported provider type: ${type}`)
    }
  }
}
