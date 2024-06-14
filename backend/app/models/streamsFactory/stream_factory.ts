import { StreamProvider } from '#models/streamsFactory/ffmpeg'
import Ffmpeg from '#models/streamsFactory/ffmpeg'

export default class StreamFactory {
  static createProvider(
    type: string,
    baseUrl: string,
    streamKey: string,
    timelinePath: string,
    logo: string,
    overlay: string,
    guestFile: string,
    cryptoFile: string
  ): StreamProvider {
    switch (type) {
      case 'ffmpeg':
        return new Ffmpeg(baseUrl, streamKey, timelinePath, logo, overlay, guestFile, cryptoFile)
      default:
        throw new Error(`Unsupported provider type: ${type}`)
    }
  }
}
