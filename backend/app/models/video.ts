import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import ffmpeg from 'fluent-ffmpeg'
import Playlist from '#models/playlist'

export default class Video extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare path: string

  @column()
  declare duration: number

  @column()
  declare isPublished: boolean

  @column()
  declare showInLive: boolean

  @column()
  declare userId: number

  @manyToMany(() => Playlist, {
    pivotTable: 'playlist_videos',
  })
  declare playlists: ManyToMany<typeof Playlist>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static async getInformation(path: string): Promise<ffmpeg.FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(path, (err: any, metadata: unknown) => {
        if (err) {
          reject(err)
        } else {
          resolve(metadata as ffmpeg.FfprobeData)
        }
      })
    })
  }

  static async getDuration(path: string): Promise<number | undefined> {
    const metadata = await Video.getInformation(path)
    return metadata.format.duration
  }

  async elapsedTime(): Promise<number> {
    const now = DateTime.now()
    const diff = now.diff(this.duration, 'milliseconds')
    return diff.milliseconds
  }
  async getDurationInSeconde() {
    if (this.duration >= 0) {
      return this.duration
    } else return 0
  }

  async getDurationInMilisecond(): Promise<number> {
    return (await this.getDurationInSeconde()) * 1000
  }

  getDurationInFormat(): string {
    const duration = this.duration
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = Math.floor(duration % 60)
    return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds > 0 ? seconds + 's' : ''}`
  }
}
