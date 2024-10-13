import { StreamProvider } from '#models/streamsFactory/ffmpeg'
import Ffmpeg from '#models/streamsFactory/ffmpeg'
import Ytbdownload from '#models/streamsFactory/ytb_download'

interface Channel {
  type: string;
  streamKey: string;
}


export default class StreamFactory {
  static createProvider(
    type: string,
    channels: Channel[],
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
      case 'ytbdownload':
        return new Ytbdownload()
      default:
        throw new Error(`Unsupported provider type: ${type}`)
    }
  }
}
