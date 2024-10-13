import drive from '@adonisjs/drive/services/main'
import fs, { PathLike } from 'node:fs'
import { cuid } from '@adonisjs/core/helpers'
import { BaseModel } from '@adonisjs/lucid/orm'
import { Readable } from 'node:stream'
import { DateTime } from 'luxon'
import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

interface MultipartFile {
  path?: PathLike
  tmpPath?: PathLike
  extname: string
  type: string
}

export default class Asset extends BaseModel {
  static async getPublicUrl(path: string): Promise<string> {
    try {
      // Utilise getUrl pour obtenir le chemin généré
      const baseUrl = await drive.use('s3').getUrl(path)

      // Remplace ou ajoute manuellement la partie AUTH manquante dans l'URL
      return baseUrl.replace(
        'https://s3.pub1.infomaniak.cloud/',
        'https://s3.pub1.infomaniak.cloud/object/v1/AUTH_e99c1f0a844e46a6a881da20d4f30de8/'
      )
    } catch (error) {
      throw new Error(`Failed to generate public URL: ${error.message}`)
    }
  }

  static async signedUrl(path: string, expiresIn: string = '1h'): Promise<string> {
    return await drive.use('s3').getSignedUrl(path, {
      expiresIn: expiresIn,
    })
  }

  static async uploadToS3(
    file: MultipartFile,
    location?: string,
    visibility?: boolean
  ): Promise<string> {
    try {
      const stream = fs.createReadStream(file.path || file.tmpPath)

      // Si file.extname est défini, on l'utilise. Sinon, on utilise simplement le chemin du fichier.
      const key = location
        ? file.extname
          ? `${location}/${cuid()}.${file.extname}`
          : `${location}/${file.path?.toString().split('/').pop()}`
        : file.extname
          ? `${cuid()}.${file.extname}`
          : `${file.path?.toString().split('/').pop()}`

      await drive.use('s3').putStream(key, stream, {
        ContentType: file.type,
        ACL: visibility ? 'public-read' : 'private',
      })

      return key
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`)
    }
  }

  static async getInfo(path: string): Promise<any> {
    return await drive.use('s3').getMetaData(path)
  }

  static async deleteFromS3(path): Promise<void> {
    try {
      await drive.use('s3').delete(path)
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error.message}`)
    }
  }

  static async uploadStreamToS3(
    stream: Readable,
    contentType: string,
    visibility?: boolean
  ): Promise<string> {
    try {
      const timestamp = DateTime.now().toFormat('yyyyMMdd_HHmmss')
      const uniqueKey = `videos/${timestamp}_${cuid()}.mp4`
      await drive.use('s3').putStream(uniqueKey, stream, {
        ContentType: contentType,
        ACL: visibility ? 'public-read' : 'private',
      })
      console.log(`Uploaded stream to S3 at: ${uniqueKey}`)
      return uniqueKey
    } catch (error) {
      throw new Error(`Failed to upload stream to S3: ${error.message}`)
    }
  }

  static async createPresignedUrl(
    filename: string,
    fileType: string,
    expiresIn: string = '1h'
  ): Promise<string> {
    const key = `restream/uploads/videos/${cuid()}_${filename}`
    return await drive.use('s3').getSignedUrl(key, {
      expiresIn: expiresIn,
      contentType: fileType,
      acl: 'public-read',
    })
  }

  static async generateS3UploadPolicy(fileName: string, fileType: string) {
    const bucket = process.env.S3_BUCKET
    const region = process.env.S3_REGION
    const accessKeyId = process.env.S3_ACCESS_KEY_ID
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
    const endpoint = process.env.S3_ENDPOINT

    const s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    })

    const key = `${DateTime.now().toFormat('yyyyMMdd_HHmmss')}_${fileName}`

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: bucket,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 5 * 1024 * 1024],
        ['starts-with', '$Content-Type', 'video/'],
      ],
      Fields: {
        'success_action_status': '201',
        'Content-Type': fileType,
      },
      Expires: 3600,
    })

    return { url, fields }
  }
}
