import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import * as fs from 'node:fs'
import path from 'node:path'
import TimelineItem from '#models/timeline_item'

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
      totalDuration += playlist.getTotalDuration()
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
      totalVideos += playlist.getVideoCount()
    }
    return totalVideos
  }

  async loadPlaylist() {
    try {
      const contents = await fs.promises.readFile(this.filePath, 'utf8')
      return contents
    } catch (error) {
      console.error(`Erreur lors de la lecture du fichier de la playlist ${this.id} :`, error)
      throw error
    }
  }

  //generate playlist file from videos in playlist in type m3u8 or txt
  async generatePlaylistFile(type: string = 'm3u8') {
    let content = ''
    try {
      this.filePath = path.join('resources', 'assets', 'playlists', `playlist${this.id}.${type}`)
      //if file exists delete it
      if (fs.existsSync(this.filePath)) {
        await fs.promises.unlink(this.filePath)
      }

      if (type === 'm3u8') {
        content = '#EXTM3U\n'
        for (const video of this.videos) {
          if (video) {
            let relativePath = path.relative('/', video.path)
            logger.info(`Adding video ${video.id} to playlist ${this.id}`)
            content += `#EXTINF:-1, ${video.title || 'undefined'}\n`
            content += `file '/${relativePath}'\n`
          }
        }
      } else if (type === 'txt') {
        content = ''
        for (const video of this.videos) {
          if (video) {
            logger.info(`Adding video ${video.id} to playlist ${this.id}`)
            content += `file /${video.path}\n`
          }
        }
      } else {
        return new Error(`Type de fichier de playlist inconnu : ${type}`)
      }

      const dirPath = path.dirname(this.filePath)
      await fs.promises.mkdir(dirPath, { recursive: true })
      await fs.promises.writeFile(this.filePath, content)
    } catch (error) {
      console.error(`Erreur lors de l'écriture du fichier de la playlist ${this.id} :`, error)
      throw error
    }
  }
}
