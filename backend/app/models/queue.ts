import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import Video from '#models/video'

interface QueueItem {
  video: Video
  startTimeCode: string | null
  endTimeCode: string | null
  resolve: (value: string | PromiseLike<string>) => void
  reject: (reason?: any) => void
}

export default class Queue extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  private queue: QueueItem[] = []
  private isEncoding: boolean = false
  private static instance: Queue

  private constructor() {
    super()
  }

  async add(
    video: Video,
    startTimeCode: string | null,
    endTimeCode: string | null
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.queue.push({ video, startTimeCode, endTimeCode, resolve, reject })
      if (!this.isEncoding) {
        //run encoding
      }
    })
  }

  private async processQueue(): Promise<void> {
    this.queue.shift()
    this.isEncoding = false
    if (this.queue.length > 0) {
      //run encoding
    }
  }

  static getInstance(): Queue {
    if (!Queue.instance) {
      Queue.instance = new Queue()
    }
    return Queue.instance
  }
}
