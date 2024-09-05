import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
  manyToMany,
  afterCreate,
  beforeDelete,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import logger from '@adonisjs/core/services/logger'
import Provider from '#models/providers/provider'
import StreamFactory from '#models/streamsFactory/stream_factory'
import { StreamProvider } from '#models/streamsFactory/ffmpeg'
import Timeline from '#models/timeline'
import Video from '#models/video'
import { cuid } from '@adonisjs/core/helpers'
import { drive } from '#config/drive'
import emitter from '@adonisjs/core/services/emitter'
import pidusage from 'pidusage'
import si from 'systeminformation';
import transmit from '@adonisjs/transmit/services/main'

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
  declare userId: number

  @column()
  declare providerId: number

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
    pivotColumns: ['on_primary'],
  })
  declare providers: ManyToMany<typeof Provider>

  @belongsTo(() => Timeline)
  declare timeline: BelongsTo<typeof Timeline>
  declare streamProvider: StreamProvider | null
  canNextVideo: boolean = false
  declare providersInstance: Provider[]
  declare primaryProvider: Provider | null
  declare streamStartTime: DateTime
  declare nextVideoTimeout: NodeJS.Timeout | null
  private analyticsInterval: NodeJS.Timeout | null = null
  private currentBitrate: number = 0


  @afterCreate()
  static async createBaseFiles(stream: Stream) {
    const guestKey = `datas/streams/${cuid()}_guest.txt`
    stream.guestFile = guestKey
    await drive.use().put(guestKey, 'Upload by : CoffeeStream')
    await stream.save()
  }

  @beforeDelete()
  static async deleteBaseFiles(stream: Stream) {
    await stream.removeAssets()
  }

  async updateGuestText() {
    const currentVideo = await this.timeline.getCurrentVideo(this.currentIndex)
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
    const currentVideo: Video = await this.timeline.getCurrentVideo(this.currentIndex)
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

    const providers = await this.related('providers').query().pivotColumns(['on_primary'])
    this.providersInstance = await Promise.all(
      providers.map((provider) => Provider.createProvider(provider))
    )
    const primary = this.providersInstance.find(
      (provider) => provider.$extras.pivot_on_primary === 1
    )
    this.primaryProvider = primary ?? null
    this.currentIndex = 0

    if (this.primaryProvider) {
      this.streamProvider = StreamFactory.createProvider(
        this.type,
        this.primaryProvider.baseUrl,
        this.primaryProvider.streamKey,
        this.timeline.filePath,
        this.logo || '',
        this.overlay || '',
        this.guestFile,
        this.enableBrowser,
        this.webpageUrl
      )

      await this.start()
      await emitter.emit('stream:onNextVideo', this.id)
      this.streamStartTime = DateTime.now()
      this.canNextVideo = true

      await this.nextVideo()
    } else {
      logger.warn('No primary provider found')
    }
    await this.save()
  }

  async start(): Promise<void> {
    this.pid = this.streamProvider ? this.streamProvider.startStream(this.updateBitrate.bind(this)) : process.pid
    this.startTime = DateTime.now()
    this.status = 'active'
    await this.sendAnalytics()

    await this.save()
  }

  private updateBitrate(bitrate: number) {
    this.currentBitrate = bitrate;
  }

  sendAnalytics = async () => {
    if (this.status === 'inactive') return;

    pidusage(this.pid, async (err, stats) => {
      if (err || this.pid === 0) {
        if (this.analyticsInterval) {
          clearTimeout(this.analyticsInterval);
          this.analyticsInterval = null;
        }
        return;
      }

      // Utiliser systeminformation pour obtenir les statistiques réseau
      const networkStats = await si.networkStats();
      const inputBytes = networkStats[0]?.rx_bytes || 0;  // Octets reçus
      const outputBytes = networkStats[0]?.tx_bytes || 0; // Octets envoyés

      // Conversion des octets en Mbps
      const inputMbps = (inputBytes * 8) / 1_000_000;  // en Mbps
      const outputMbps = (outputBytes * 8) / 1_000_000; // en Mbps

      const analyticsData = {
        cpu: stats.cpu,
        memory: stats.memory / 1024 / 1024,
        bitrate: this.currentBitrate,
        network: {
          input: inputMbps,
          output: outputMbps
        }
      };
      // Envoyer les statistiques au frontend via WebSocket ou autre méthode
      transmit.broadcast(`streams/${this.id}/analytics`, { stats: analyticsData });

      // Mettre à jour les analytics chaque seconde
      this.analyticsInterval = setTimeout(() => this.sendAnalytics(), 8000);
    });
  }

  async stop(): Promise<void> {
    logger.info(`Stopping streams ${this.id}`)
    clearTimeout(this.nextVideoTimeout as NodeJS.Timeout)

    if (this.streamProvider) {
      this.streamProvider.stopStream(this.pid)
    } else {
      if (this.pid > 0) {
        process.kill(this.pid, 'SIGKILL')
      }
    }
    this.endTime = DateTime.now()
    this.status = 'inactive'
    this.pid = 0

    await this.save()
  }

  async restartStream() {
    logger.info('Redémarrage du stream')
    await this.stop()

    const remainingTime = await this.timeline.getTimeRestOfVideos(this.currentIndex)
    logger.warn(`Temps restant : ${remainingTime}`)
    if (remainingTime > this.restartTimes) {
      await this.timeline.generatePlaylistFile('m3u8', this.currentIndex)
    } else {
      await this.timeline.generatePlaylistFileWithRepetition('m3u8', this.currentIndex)
    }
    setTimeout(async () => {
      await this.run()
    }, 10000)
  }

  async getPrimaryProvider() {
    const providers = await this.related('providers').query().pivotColumns(['on_primary'])
    const primary = providers.find((provider) => provider.$extras.pivot_on_primary === 1)
    return primary ?? null
  }

  async removeAssets() {
    if (this.logo) {
      try {
        await drive.use().delete(this.logo)
      } catch (err) {
        logger.error(err)
      }
    }

    if (this.overlay) {
      try {
        await drive.use().delete(this.overlay)
      } catch (err) {
        logger.error(err)
      }
    }

    if (this.guestFile) {
      try {
        await drive.use().delete(this.guestFile)
      } catch (err) {
        logger.error(err)
      }
    }
  }
}
