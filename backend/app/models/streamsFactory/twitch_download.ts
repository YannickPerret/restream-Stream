import fs from 'node:fs'
import {YtdlCore} from '@ybd-project/ytdl-core'
import Asset from '#models/asset'
import {exec} from 'node:child_process'
import app from '@adonisjs/core/services/app'

export default class TwitchDownload {
  /**
   * Download a Twitch video using yt-dlp and upload it to S3.
   * @param url - The URL of the Twitch video to download.
   * @returns The S3 URL of the uploaded video.
   */
  static async download(url: string): Promise<string> {
    try {
      // Define the output file path with .mp4 extension
      const outputFile = app.publicPath('assets/videos', `${Date.now()}.mp4`)

      // Execute yt-dlp command to download the "Source" format video
      await new Promise((resolve, reject) => {
        const command = `yt-dlp -f "Source" -o "${outputFile}" ${url}`
        const ytProcess = exec(command)

        ytProcess.stdout?.on('data', (data) => console.log(`stdout: ${data}`))
        ytProcess.stderr?.on('data', (data) => console.error(`stderr: ${data}`))

        ytProcess.on('close', (code) => {
          if (code === 0) {
            console.log('Download completed successfully.')
            resolve(true)
          } else {
            reject(new Error(`yt-dlp exited with code ${code}`))
          }
        })
      })

      // Create a read stream for the downloaded file
      const fileStream = fs.createReadStream(outputFile)

      // Upload the video to S3 and return the URL
      const extname = 'mp4' // Set the extension to .mp4 for Source format
      const s3Url = await Asset.uploadStreamToS3(fileStream, `video/${extname}`, true)

      // Clean up the local file after uploading
      fs.unlink(outputFile, (err) => {
        if (err) console.error(`Error deleting local file: ${err.message}`)
      })

      return s3Url
    } catch (error) {
      console.error(`Error downloading video: ${error.message}`)
      throw error
    }
  }

  /**
   * Get basic information about a Twitch video.
   * @param url - The URL of the Twitch video.
   * @returns The video information.
   */
  static async getVideoInfo(url: string): Promise<any> {
    try {
      // Create a new instance of YtdlCore
      const ytdl = new YtdlCore()

      // Fetch basic info of the video
      return await ytdl.getBasicInfo(url)
    } catch (error) {
      console.error(`Error getting video info: ${error.message}`)
      throw error
    }
  }
}
