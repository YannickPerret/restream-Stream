import fs from 'node:fs'
import {YtdlCore} from '@ybd-project/ytdl-core'
import Asset from '#models/asset'
import {exec} from 'node:child_process'
import app from '@adonisjs/core/services/app'

export default class YtDownload {
  static async download(url: string): Promise<string> {
    try {
      const outputFile = app.publicPath('assets/videos', `${Date.now()}.webm`)

      await new Promise((resolve, reject) => {
        const command = `yt-dlp -f "bestvideo[height<=1080][fps=60]+bestaudio/best[height<=1080][fps=60]" -o "${outputFile}" ${url}`
        const ytProcess = exec(command)

        ytProcess.stdout?.on('data', (data) => console.log(`stdout: ${data}`))
        ytProcess.stderr?.on('data', (data) => console.error(`stderr: ${data}`))

        ytProcess.on('close', (code) => {
          if (code === 0) {
            console.log('Download completed')
            resolve(true)
          } else {
            reject(new Error(`yt-dlp exited with code ${code}`))
          }
        })
      })

      const fileStream = fs.createReadStream(outputFile)

      const extname = 'webm'

      return await Asset.uploadStreamToS3(fileStream, `video/${extname}`, true)
    } catch (error) {
      console.error(`Error downloading video: ${error.message}`)
      throw error
    }
  }

  /**
   * Get detailed information about a Twitch video using yt-dlp.
   * @param url - The URL of the Twitch video.
   * @returns The video information as an object.
   */
  static async getVideoInfo(url: string): Promise<any> {
    try {
      return await new Promise((resolve, reject) => {
        const command = `yt-dlp -j ${url}`
        const ytProcess = exec(command)

        let output = ''

        ytProcess.stdout?.on('data', (data) => {
          output += data
        })

        ytProcess.stderr?.on('data', (data) => {
          console.error(`stderr: ${data}`)
        })

        ytProcess.on('close', (code) => {
          if (code === 0) {
            const videoInfo = JSON.parse(output)
            resolve(videoInfo)
          } else {
            reject(new Error(`yt-dlp exited with code ${code}`))
          }
        })
      })
    } catch (error) {
      console.error(`Error getting video info: ${error.message}`)
      throw error
    }
  }
}
