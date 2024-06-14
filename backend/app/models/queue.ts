import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import logger from '@adonisjs/core/services/logger'
import Video from '#models/video'
import VideoEncoder from '#models/video_encoder'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import QueueItem from '#models/queue_item'

export default class Queue extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare active: boolean

  @column()
  declare maxSlots: number

  @column()
  declare maxConcurrent: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => QueueItem)
  declare items: HasMany<typeof QueueItem>

  private isEncoding: boolean = false
  private currentEncodings: number = 0
  private static instance: Queue

  static async findOrCreateQueue(): Promise<Queue> {
    let queue = await this.query().where('active', true).preload('items').first()
    if (!queue) {
      queue = await Queue.create({
        title: 'Default Queue',
        active: true,
        maxSlots: 50,
        maxConcurrent: 1,
      })
    }
    return queue
  }

  static getInstance(): Queue {
    if (!Queue.instance) {
      Queue.instance = new Queue()
    }
    return Queue.instance
  }

  async add(
    video: Video,
    startTimeCode: string | null,
    endTimeCode: string | null
  ): Promise<string> {
    return new Promise(async (resolve) => {
      let queue = await Queue.findOrCreateQueue()
      let activeItemsCount = await QueueItem.query()
        .where('queueId', queue.id)
        .andWhere((builder) => {
          builder.where('status', 'pending').orWhere('status', 'processing')
        })
        .count('* as total')

      const totalActiveItems = Number(activeItemsCount[0].$extras.total)

      if (totalActiveItems >= queue.maxSlots) {
        queue = await Queue.create({
          title: `Queue ${DateTime.now().toFormat('yyyyLLddHHmmss')}`,
          active: true,
          maxSlots: queue.maxSlots,
          maxConcurrent: queue.maxConcurrent,
        })
      }

      await QueueItem.create({
        queueId: queue.id,
        videoId: video.id,
        startTimeCode,
        endTimeCode,
        status: 'pending',
        attempts: 0,
      })

      if (!this.isEncoding) {
        await this.runEncoding(queue.id)
      }

      resolve(video.path)
    })
  }

  private async runEncoding(queueId: number): Promise<void> {
    const queue = await Queue.query().where('id', queueId).preload('items').first()
    if (!queue || !queue.active) return

    const queueItems = await QueueItem.query()
      .where('queueId', queueId)
      .andWhere('status', 'pending')
    if (queueItems.length === 0 || this.currentEncodings >= queue.maxConcurrent) return

    this.isEncoding = true
    this.currentEncodings++

    const { videoId, startTimeCode, endTimeCode } = queueItems[0]
    queueItems[0].status = 'processing'
    await queueItems[0].save()
    const video = await Video.find(videoId)
    if (!video) {
      logger.error(`Video with ID ${videoId} not found`)
      return
    }

    try {
      video.path = await VideoEncoder.encode(video, startTimeCode, endTimeCode, queueItems.length)
      await video.save()
      queueItems[0].status = 'completed'
    } catch (error) {
      logger.error(error)
      queueItems[0].attempts += 1
      if (queueItems[0].attempts < 3) {
        queueItems[0].status = 'pending'
      } else {
        queueItems[0].status = 'failed'
        await queueItems[0].delete()
      }
    }

    this.currentEncodings--
    await this.processQueue(queueId)
    await queueItems[0].save()
  }

  private async processQueue(queueId: number): Promise<void> {
    this.isEncoding = false
    const nextItem = await QueueItem.query()
      .where('queueId', queueId)
      .andWhere('status', 'pending')
      .first()
    if (nextItem) {
      await this.runEncoding(queueId)
    }
  }
}
