import { DateTime } from 'luxon'
import {
  afterCreate,
  BaseModel,
  beforeDelete,
  belongsTo,
  column,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import Provider from '#models/providers/provider'
import { StreamProvider } from '#models/streamsFactory/ffmpeg'
import Timeline from '#models/timeline'
import Video from '#models/video'
import { cuid } from '@adonisjs/core/helpers'
import emitter from '@adonisjs/core/services/emitter'
import pidusage from 'pidusage'
import si from 'systeminformation'
import transmit from '@adonisjs/transmit/services/main'
import StreamSchedule from '#models/stream_schedule'
import drive from '@adonisjs/drive/services/main'
import Asset from '#models/asset'
import RedisProvider from '#models/redis_provider'

export default class Stream extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare pid: number

  @column()
  declare status: 'active' | 'inactive'

  @column()
  declare restartTimes: number

  @column()
  declare currentIndex: number

  @column()
  declare type: string

  @column()
  declare resolution: string

  @column()
  declare fps: number

  @column()
  declare bitrate: string

  @column()
  declare userId: number

  @column()
  declare timelineId: number

  @column()
  declare overlay: string | null | undefined

  @column()
  declare guestFile: string

  @column()
  declare cryptoFile: string

  @column()
  declare logo: string | null | undefined

  @column()
  declare enableBrowser: boolean

  @column()
  declare webpageUrl: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => StreamSchedule)
  declare streamSchedule: HasMany<typeof StreamSchedule>

  @column.dateTime()
  declare startTime: DateTime | null

  @column.dateTime()
  declare endTime: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Provider, {
    pivotTable: 'stream_providers',
  })
  declare providers: ManyToMany<typeof Provider>

  @belongsTo(() => Timeline)
  declare timeline: BelongsTo<typeof Timeline>
  declare streamProvider: StreamProvider | null
  private canNextVideo: boolean = false
  declare streamStartTime: DateTime
  declare nextVideoTimeout: NodeJS.Timeout | null
  private analyticsInterval: NodeJS.Timeout | null = null
  private currentBitrate: number = 0

  @afterCreate()
  static async createBaseFiles(stream: Stream) {
    const guestKey = `datas/streams/${cuid()}_guest.txt`

    // Vérifier si le fichier existe déjà
    const fileExists = await drive.use('fs').exists(guestKey)

    // Si le fichier n'existe pas, on le crée
    if (!fileExists) {
      stream.guestFile = guestKey
      await drive.use().put(guestKey, 'Upload by : CoffeeStream')
      await stream.save()
    } else {
      console.log(`File ${guestKey} already exists.`)
    }
  }

  @beforeDelete()
  static async deleteBaseFiles(stream: Stream) {
    await stream.removeAssets()
  }

  async updateGuestText() {
    const currentVideo = await this.timeline.getCurrentVideo(this.currentIndex)

    if (!currentVideo) {
      logger.error(`No current video found at index ${this.currentIndex}.`)
      return
    }

    await currentVideo.load('user')

    const guestText = !currentVideo.showInLive
      ? ''
      : currentVideo.user
        ? `Upload by : ${currentVideo.user.username}`
        : 'Guest is not loaded for the current video'

    await drive.use().put(this.guestFile, guestText)
  }

  async nextVideo() {
    if (this.status === 'inactive' || !this.canNextVideo) {
      logger.info('Stream is not live or not ready to switch videos.')
      return
    }
    const currentVideo: Video | null = await this.timeline.getCurrentVideo(this.currentIndex)
    if (!currentVideo) {
      logger.error('No current video found.')
      return false
    }

    const durationMs: number = await currentVideo.getDurationInMilisecond()

    const totalStreamTime = DateTime.now().diff(this.streamStartTime).as('milliseconds')

    if (totalStreamTime + durationMs > this.restartTimes) {
      logger.info('28h de stream atteint, arrêt du stream après la vidéo en cours')
      this.canNextVideo = false
      this.scheduleRestart(durationMs)
    } else {
      this.scheduleNextVideo(durationMs)
    }
  }

  private scheduleNextVideo(durationMs: number) {
    this.nextVideoTimeout = setTimeout(async () => {
      if (this.status === 'inactive') {
        logger.info('Stream has been stopped. Not proceeding to the next video.')
        return
      }

      await this.moveToNextVideo()

      if (!(await this.timeline.getCurrentVideo(this.currentIndex))) {
        logger.info('Fin de la playlist.')
        await this.restartStream()
        return
      }
      await emitter.emit('stream:onNextVideo', this.id)

      await this.save()
      await this.nextVideo()
    }, durationMs)
  }

  private scheduleRestart(durationMs: number) {
    this.nextVideoTimeout = setTimeout(async () => {
      await this.restartStream()
    }, durationMs)
  }

  async moveToNextVideo() {
    const videos = await this.timeline.videos()
    if (this.currentIndex + 1 < videos.length) {
      this.currentIndex++
    } else {
      this.currentIndex = 0
    }
  }

  async run() {
    logger.info(`Starting stream ${this.id}`)
    await this.load('providers')
    await this.load('timeline')

    if (this.status === 'active') {
      logger.info('Stream is already active.')
      return
    }

    this.currentIndex = 0

    if (this.providers.length === 0) {
      logger.error('No providers associated with the stream.')
      return
    }
    const streamData = {
      id: this.id,
      name: this.name,
      resolution: this.resolution,
      fps: this.fps,
      bitrate: this.bitrate,
      logo: this.logo,
      overlay: this.overlay,
      guestFile: this.guestFile,
      enableBrowser: this.enableBrowser,
      webpageUrl: this.webpageUrl,
      timelinePath: await Asset.getPublicUrl(this.timeline.filePath),
      channels: this.providers.map((provider) => ({
        streamKey: provider.streamKey,
        type: provider.type,
      })),
    }

    await RedisProvider.save('stream', this.id.toString(), streamData)
    await RedisProvider.publish(`stream:${this.id}:start`, streamData)

    this.startTime = DateTime.now()
    this.streamStartTime = DateTime.now()
    this.canNextVideo = true
    this.status = 'active'

    await this.save()
    await this.nextVideo()
  }

  async stop(): Promise<void> {
    logger.info(`Stopping stream ${this.id}`)
    clearTimeout(this.nextVideoTimeout as NodeJS.Timeout)

    await RedisProvider.publish(`stream:${this.id}:stop`, { id: this.id })
    await RedisProvider.delete('stream', this.id.toString())

    this.status = 'inactive'
    this.endTime = DateTime.now()
    this.pid = 0

    await this.save()
  }
  /*
  async start(): Promise<void> {

    this.pid = this.streamProvider
      ? this.streamProvider.startStream()
      : process.pid
    this.startTime = DateTime.now()
    this.status = 'active'
    await this.sendAnalytics()
    await this.save()
  }*/

  sendAnalytics = async () => {
    if (this.status === 'inactive') return

    pidusage(this.pid, async (err, stats) => {
      console.log(err, this.pid)
      if (err || this.pid === 0) {
        if (this.analyticsInterval) {
          clearTimeout(this.analyticsInterval)
          this.analyticsInterval = null
        }
        return
      }

      console.log('Sending analytics for stream', this.id)
      // Utiliser system information pour obtenir les statistiques réseau
      const networkStats = await si.networkStats()
      const inputBytes = networkStats[0]?.rx_bytes || 0 // Octets reçus
      const outputBytes = networkStats[0]?.tx_bytes || 0 // Octets envoyés

      // Conversion des octets en Mbps
      const inputMbps = (inputBytes * 8) / 1000000 // en Mbps
      const outputMbps = (outputBytes * 8) / 1000000 // en Mbps

      const analyticsData = {
        cpu: stats.cpu,
        memory: stats.memory / 1024 / 1024,
        bitrate: this.currentBitrate,
        network: {
          input: inputMbps,
          output: outputMbps,
        },
      }
      transmit.broadcast(`streams/${this.id}/analytics`, { stats: analyticsData })

      this.analyticsInterval = setTimeout(() => this.sendAnalytics(), 8000)
    })
  }
}
