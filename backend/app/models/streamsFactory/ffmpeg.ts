import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import env from '#start/env'
import { spawn } from 'node:child_process'

export default class Ffmpeg extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  declare instance: any

  run() {
    const parameters = [
      '-nostdin', // Disable stdin interaction
      '-re', // Read file at normal speed
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      `concat:/Users/tchoune/Documents/dev/js/coffeeStream/backend/ressources/playlists/playlist.m3u8`, // Specify input path
      '-vsync',
      'cfr', // Constant Frame Rate
      '-copyts', // Copy timestamps
      '-pix_fmt',
      'yuv420p', // Pixel format needed for compatibility
      '-s',
      '1920x1080', // Output resolution
      '-c:v',
      'libx264', // H.264 video codec
      '-profile:v',
      'high', // H.264 profile
      '-preset',
      'veryfast', // Encoder preset to reduce CPU load
      '-b:v',
      '6000k', // Video bitrate
      '-maxrate',
      '7000k', // Maximum rate
      '-minrate',
      '5000k', // Minimum rate
      '-bufsize',
      '9000k', // Buffer size
      '-g',
      '120', // Interval between key frames
      '-r',
      '60', // Frame rate
      '-c:a',
      'aac', // Audio codec
      '-f',
      'flv', // Output format Flash Video
      `rtmp://live.twitch.tv/app/${env.get('STREAM_KEY')}`, // Streaming URL
    ]

    this.instance = spawn('ffmpeg', parameters, {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    return this.instance
  }
}
