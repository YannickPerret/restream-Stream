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
    enableBrowser: boolean,
    webpageUrl: string,
    bitrate: string,
    resolution: string,
    fps: number
  ): StreamProvider {
    switch (type) {
      case 'ffmpeg':
        return new Ffmpeg(
          baseUrl,
          streamKey,
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
      default:
        throw new Error(`Unsupported provider type: ${type}`)
    }
  }
}
