import { DateTime } from 'luxon'
import { BaseModel, beforeDelete, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import * as fs from 'node:fs'
import path from 'node:path'
import TimelineItem from '#models/timeline_item'
import logger from '@adonisjs/core/services/logger'
import Playlist from '#models/playlist'
import Video from '#models/video'
import app from '@adonisjs/core/services/app'
import Stream from '#models/stream'
import env from '#start/env'

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
  declare showInLive: boolean

  @column()
  declare userId: number

  @column()
  declare streamId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => TimelineItem, {
    foreignKey: 'timelineId',
    onQuery: (query) => query.orderBy('order', 'asc'),
  })
  declare items: HasMany<typeof TimelineItem>

  @hasMany(() => Stream)
  declare streams: HasMany<typeof Stream>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeDelete()
  static async deletePlaylistFile(timeline: Timeline) {
    if (timeline.filePath && fs.existsSync(timeline.filePath)) {
      await fs.promises.unlink(timeline.filePath)
    }
  }

  async generatePlaylistFile(type: string = 'm3u8', currentIndex: number = 0) {
    await this.load('items', (query) => {
      query.orderBy('order', 'asc')
    })

    let content = ''
    /*this.filePath = path.join(
      app.publicPath(env.get('TIMELINE_PLAYLIST_DIRECTORY'), `playlist${this.id}.${type}`)
    )*/
    this.filePath = `${crypto.randomUUID()}-${this.id}.${type}`
    const currentPath = path.join(
      app.publicPath(env.get('TIMELINE_PLAYLIST_DIRECTORY'), `${this.filePath}`)
    )

    if (fs.existsSync(currentPath)) {
      await fs.promises.unlink(currentPath)
    }

    const addItemToContent = async (item: TimelineItem) => {
      if (item.type === 'video') {
        const video = await Video.find(item.itemId)
        if (video && video.path) {
          const relativePath = path.relative('/', video.path)
          const absolutePath = `file://${path.resolve(video.path)}`
          logger.info(`Adding video Id ${item.itemId} to playlist ${this.id}`)
          if (type === 'm3u8') {
            content += `#EXTINF:-1, ${video.title || 'undefined'}\n`
            content += `file '/${relativePath}'\n`
          } else if (type === 'txt') {
            content += `${absolutePath}\n`
          }
        } else {
          logger.warn(`Video with id ${item.itemId} not found or does not have a filePath.`)
        }
      } else if (item.type === 'playlist') {
        const playlist = await Playlist.find(item.itemId)
        if (playlist) {
          await playlist.load('videos')
          for (const video of playlist.videos) {
            if (video && video.path) {
              const relativePath = path.relative('/', video.path)
              const absolutePath = `file://${path.resolve(video.path)}`
              logger.info(
                `Adding video Id ${video.id} from playlist ${playlist.id} to timeline ${this.id}`
              )
              if (type === 'm3u8') {
                content += `#EXTINF:-1, ${video.title || 'undefined'}\n`
                content += `file '/${relativePath}'\n`
              } else if (type === 'txt') {
                content += `${absolutePath}\n`
              }
            } else {
              logger.warn(`Video with id ${video.id} not found or does not have a filePath.`)
            }
          }
        } else {
          logger.warn(`Playlist with id ${item.itemId} not found.`)
        }
      }
    }

    if (type === 'm3u8') {
      content = '#EXTM3U\n'
    }

    for (let i = currentIndex; i < this.items.length; i++) {
      await addItemToContent(this.items[i])
    }

    const dirPath = path.dirname(currentPath)
    await fs.promises.mkdir(dirPath, { recursive: true })
    await fs.promises.writeFile(currentPath, content)
  }

  async generatePlaylistFileWithRepetition(type: string = 'm3u8', currentIndex: number = 0) {
    await this.load('items', (query) => {
      query.orderBy('order', 'asc')
    })

    let content = ''
    this.filePath = `${crypto.randomUUID()}-${this.id}.${type}`
    const currentPath = path.join(
      app.publicPath(env.get('TIMELINE_PLAYLIST_DIRECTORY'), `${this.filePath}`)
    )

    if (fs.existsSync(currentPath)) {
      await fs.promises.unlink(currentPath)
    }

    if (type === 'm3u8') {
      content = '#EXTM3U\n'
      let totalDuration = 0

      const addItemToContent = async (item: TimelineItem) => {
        if (item.type === 'video') {
          const video = await Video.find(item.itemId)
          if (video && video.path) {
            const relativePath = path.relative('/', video.path)
            logger.info(`Adding video Id ${item.itemId} to playlist ${this.id}`)
            content += `#EXTINF:-1, ${video.title || 'undefined'}\n`
            content += `file '/${relativePath}'\n`
            totalDuration += video.duration * 1000
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
                totalDuration += video.duration * 1000
              } else {
                logger.warn(`Video with id ${video.id} not found or does not have a filePath.`)
              }
            }
          } else {
            logger.warn(`Playlist with id ${item.itemId} not found.`)
          }
        }
      }

      while (totalDuration < 115200000) {
        for (let i = currentIndex; i < this.items.length && totalDuration < 115200000; i++) {
          await addItemToContent(this.items[i])
        }
        currentIndex = 0
      }
    } else {
      throw new Error(`Unknown playlist file type: ${type}`)
    }

    const dirPath = path.dirname(currentPath)
    await fs.promises.mkdir(dirPath, { recursive: true })
    await fs.promises.writeFile(currentPath, content)
  }

  async getCurrentVideo(currentIndex: number): Promise<Video | null> {
    const videos = await this.videos()
    console.log('videos', videos)
    if (videos && videos.length > currentIndex) {
      return videos[currentIndex]
    } else {
      return null
    }
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

  async getNextVideo(currentIndex: number, withTransition: boolean = true) {
    const videos = await this.videos()
    if (withTransition) {
      return videos[currentIndex + 1]
    } else {
      const nextVideoIndex = videos.findIndex(
        (video, index) => index > currentIndex && !video.showInLive
      )
      return nextVideoIndex !== -1 ? videos[nextVideoIndex] : null
    }
  }

  getPreviousItem(currentIndex: number, showTransition: boolean = true) {
    if (currentIndex - 1 < 0) {
      return null
    }
    if (showTransition) {
      return this.items[currentIndex - 1] || null
    } else {
      return this.items[currentIndex - 2] || null
    }
  }

  async getRestOfVideos(currentIndex: number) {
    const videos = await this.videos()
    return videos.slice(currentIndex + 1)
  }

  async getTimeRestOfVideos(currentIndex: number) {
    const videos = await this.getRestOfVideos(currentIndex)
    return videos.reduce((acc, video) => acc + video.duration, 0)
  }

  async getItemsWithVideos() {
    await this.load('items')
    const items = []

    for (const item of this.items) {
      if (item.type === 'video') {
        const video = await Video.find(item.itemId)
        if (video) {
          items.push(video)
        }
      } else if (item.type === 'playlist') {
        const playlist = await Playlist.find(item.itemId)
        if (playlist) {
          await playlist.load('videos')
          items.push({
            ...playlist.toJSON(),
            videos: playlist.videos,
          })
        }
      }
    }

    return items
  }

  async removeFile() {
    if (this.filePath && fs.existsSync(this.filePath)) {
      await fs.promises.unlink(this.filePath)
    }
  }
}
