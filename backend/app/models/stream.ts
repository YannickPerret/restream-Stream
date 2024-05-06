import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import StreamFactory from '#models/streamsFactory/stream_factory'

export default class Stream extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare pid: number | null

  @column()
  declare status: 'active' | 'inactive'

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime()
  declare startTime: DateTime | null

  @column.dateTime()
  declare endTime: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  declare instance: any
  declare isOnLive: boolean

  async start(playlist: any = undefined, provider: string): Promise<void> {
    const streamProcessor = await StreamFactory.createStream(provider)
    if (!streamProcessor) {
      throw new Error('Invalid stream provider')
    }

    this.instance = await streamProcessor.run(playlist)

    if (this.instance?.stderr) {
      this.instance?.stderr.on('data', (data: any) => {
        logger.error(data.toString())
      })
    }

    if (this.instance?.stdout) {
      this.instance?.stdout.on('data', (data: any) => {
        logger.info(data.toString())
      })
    }

    this.instance.on('error', (error: any) => {
      logger.error(error)
    })

    this.pid = this.instance.pid.toString()
    this.startTime = DateTime.now()
    this.status = 'active'
    this.isOnLive = true

    await this.save()
  }

  async stop(): Promise<void> {
    logger.info('Stopping streams...')

    if (this.pid && this.pid > 0 && this.status === 'active') {
      logger.info(`Killing process with PID: ${this.pid}`)
      process.kill(this.pid, 'SIGKILL')
      this.endTime = DateTime.now()
      this.status = 'inactive'
      this.isOnLive = false
      this.pid = 0

      await this.save()
    }
  }
}
