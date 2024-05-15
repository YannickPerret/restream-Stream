import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import * as fs from 'node:fs'
import path from 'node:path'
import TimelineItem from '#models/timeline_item'
import logger from '@adonisjs/core/services/logger'
import Playlist from '#models/playlist'
import Video from '#models/video'

export default class Timeline extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare filePath: string

  @column()
  declare isPublished: boolean

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => TimelineItem, {
    foreignKey: 'timelineId',
    onQuery: (query) => query.orderBy('order', 'asc'),
  })
  declare items: HasMany<typeof TimelineItem>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  declare currentVideoIndex: number

  async getTotalDuration(): Promise<number> {
    const playlists = await this.related('playlists').query()
    let totalDuration = 0
    for (const playlist of playlists) {
      totalDuration += await playlist.getTotalDuration()
    }
    return totalDuration
  }

  async getPlaylistCount(): Promise<number> {
    const playlists = await this.related('playlists').query()
    return playlists.length
  }

  async getVideoCount(): Promise<number> {
    const playlists = await this.related('playlists').query()
    let totalVideos = 0
    for (const playlist of playlists) {
      totalVideos += await playlist.getVideoCount()
    }
    return totalVideos
  }

  async loadTimeline() {
    try {
      const contents = await fs.promises.readFile(this.filePath, 'utf8')
      return contents
    } catch (error) {
      console.error(`Erreur lors de la lecture du fichier de la playlist ${this.id} :`, error)
      throw error
    }
  }

  async generatePlaylistFile(type: string = 'm3u8') {
    await this.load('items', (query) => {
      query.orderBy('order', 'asc')
    })

    let content = ''
    this.filePath = path.join('resources', 'assets', 'playlists', `playlist${this.id}.${type}`)

    // If file exists, delete it
    if (fs.existsSync(this.filePath)) {
      await fs.promises.unlink(this.filePath)
    }

    if (type === 'm3u8') {
      content = '#EXTM3U\n'
      for (const item of this.items) {
        if (item.type === 'video') {
          const video = await Video.find(item.itemId)
          if (video && video.path) {
            const relativePath = path.relative('/', video.path)
            logger.info(`Adding video Id ${item.itemId} to playlist ${this.id}`)
            content += `#EXTINF:-1, ${video.title || 'undefined'}\n`
            content += `file '/${relativePath}'\n`
          } else {
            logger.warn(`Video with id ${item.itemId} not found or does not have a filePath.`)
          }
        } else if (item.type === 'playlist') {
          const playlist = await Playlist.find(item.itemId)
          if (playlist) {
            await playlist.load('videos')
            for (const video of playlist.videos) {
              logger.info(video)
              if (video && video.path) {
                const relativePath = path.relative('/', video.path)
                logger.info(
                  `Adding video Id ${video.id} from playlist ${playlist.id} to timeline ${this.id}`
                )
                content += `#EXTINF:-1, ${video.title || 'undefined'}\n`
                content += `file '/${relativePath}'\n`
              } else {
                logger.warn(`Video with id ${video.id} not found or does not have a filePath.`)
              }
            }
          } else {
            logger.warn(`Playlist with id ${item.itemId} not found.`)
          }
        }
      }
    } else {
      throw new Error(`Unknown playlist file type: ${type}`)
    }

    const dirPath = path.dirname(this.filePath)
    await fs.promises.mkdir(dirPath, { recursive: true })
    await fs.promises.writeFile(this.filePath, content)
  }
}
