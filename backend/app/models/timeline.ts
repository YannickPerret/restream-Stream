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
import app from '@adonisjs/core/services/app'

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

  currentVideoIndex: number = 0

  async getTotalDuration(): Promise<number> {
    const playlists = await this.related('playlists').query()
    let totalDuration = 0
    for (const playlist of playlists) {
      totalDuration += await playlist.getTotalDuration()
    }
    return totalDuration
  }

  async generatePlaylistFile(type: string = 'm3u8') {
    await this.load('items', (query) => {
      query.orderBy('order', 'asc')
    })

    let content = ''
    this.filePath = path.join(
      app.makePath('resources/assets/playlists', `playlist${this.id}.${type}`)
    )

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

  async getCurrentVideo() {
    const videos = await this.videos()
    return videos[this.currentVideoIndex]
  }

  async videos() {
    await this.load('items')
    const allVideos = []

    for (const item of this.items) {
      if (item.type === 'video') {
        const video = await Video.find(item.itemId)
        if (video) {
          allVideos.push(video)
        }
      } else if (item.type === 'playlist') {
        const playlist = await Playlist.find(item.itemId)
        if (playlist) {
          await playlist.load('videos')
          allVideos.push(...playlist.videos)
        }
      }
    }

    return allVideos
  }

  async getNextVideo(showTransition: boolean = true) {
    const videos = await this.videos()
    const nextIndex = showTransition ? this.currentVideoIndex + 1 : this.currentVideoIndex + 2
    if (nextIndex >= videos.length) {
      return null
    }
    return videos[nextIndex]
  }

  async moveToNextVideo() {
    this.currentVideoIndex++
    const videos = await this.videos()
    if (this.currentVideoIndex >= videos.length) {
      this.currentVideoIndex = 0
    }
    await this.save()
  }

  getPreviousItem(showTransition: boolean = true): TimelineItem | null {
    if (this.currentVideoIndex - 1 < 0) {
      return null
    }
    if (showTransition) {
      return this.items[this.currentVideoIndex - 1] || null
    } else {
      return this.items[this.currentVideoIndex - 2] || null
    }
  }
}
