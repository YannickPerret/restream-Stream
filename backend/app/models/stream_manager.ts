import Stream from '#models/stream'

export class StreamManager {
  private static instance: StreamManager
  private streams: Map<string, Stream> = new Map()

  private constructor() {}

  static getInstance(): StreamManager {
    if (!StreamManager.instance) {
      StreamManager.instance = new StreamManager()
    }
    return StreamManager.instance
  }

  addStream(id: string, stream: Stream): void {
    this.streams.set(id, stream)
  }

  removeStream(id: string): void {
    this.streams.delete(id)
  }

  getStream(id: string): Stream | undefined {
    return this.streams.get(id)
  }

  async getOrAddStream(id: string, stream: Promise<Stream>): Promise<Stream> {
    if (!this.streams.has(id)) {
      this.streams.set(id, await stream)
    }
    return this.streams.get(id)!
  }

  getAllStreams(): Stream[] {
    return Array.from(this.streams.values())
  }
}

const instance = StreamManager.getInstance()
Object.freeze(instance)

export default instance
