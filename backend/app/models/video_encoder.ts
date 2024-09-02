import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import ffmpeg from 'fluent-ffmpeg'
import logger from '@adonisjs/core/services/logger'
import * as fs from 'node:fs'
import env from '#start/env'
import Video from '#models/video'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'

export default class VideoEncoder extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static async encode(
    video: Video,
    startTimeCode: string | null,
    endTimeCode: string | null,
    maxQueueSize: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      logger.info(`1: Encoding video: ${video.title} with id: ${video.id} started`)
      let encode = ffmpeg(video.path).outputOptions([
        '-fflags +genpts', // Ensures the generation of timestamps
        '-vsync cfr', // Use Constant Frame Rate
        '-s 1920x1080', // Output resolution
        '-r 60', // Frame rate
        `-c:v libx264`, // H.264 video codec
        '-b:v 6000k', // Video bitrate
        '-preset veryfast', // Use a faster preset to reduce CPU load
        '-c:a aac', // Audio codec
        '-b:a 160k', // Audio bitrate
        '-ar 48000', // Audio sampling rate
      ])

      if (startTimeCode) {
        encode = encode.inputOption('-ss', startTimeCode)
      }

      if (endTimeCode) {
        encode = encode.outputOptions('-to', endTimeCode)
      }
      const outputPath = `${app.publicPath(env.get('VIDEO_DIRECTORY'))}/${cuid()}.mp4`

      encode
        .on('start', () => {
          logger.info(`2: Encoding started for video: ${video.title}`)
        })
        .on('progress', (progress) => {
          const percentage = progress.percent
          const elapsed = progress.timemark

          // Parsing the elapsed time into seconds
          let [hours, minutes, seconds] = elapsed.split(':')
          seconds = Number.parseFloat(seconds)
          hours = Number.parseInt(hours, 10)
          minutes = Number.parseInt(minutes, 10)

          const totalElapsedSeconds = hours * 3600 + minutes * 60 + seconds

          // Estimate the total duration based on current progress
          const totalEstimatedSeconds = totalElapsedSeconds / (percentage / 100)

          // Calculate remaining seconds
          const remainingSeconds = totalEstimatedSeconds - totalElapsedSeconds

          // Log the current state and estimated remaining time
          logger.info(
            `Processing [1/${maxQueueSize}]: ${percentage.toFixed(2)}% done, estimated time remaining: ${remainingSeconds.toFixed(0)} seconds`
          )
        })
        .on('end', () => {
          fs.unlinkSync(video.path)
          resolve(outputPath)
        })
        .on('error', (err) => {
          logger.error(err)
          reject(err)
        })
        .save(outputPath)
    })
  }
}
