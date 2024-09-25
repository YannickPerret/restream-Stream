import { BaseModel } from '@adonisjs/lucid/orm'
import drive from '@adonisjs/drive/services/main'
import { cuid } from '@adonisjs/core/helpers'

export default class Asset extends BaseModel {
  static async signedUrl(path: string): Promise<string | null> {
    return await drive.use('s3').getSignedUrl(path, {
      expiresIn: '1h', // Lien valide pour 1 heure
    })
  }

  static async uploadToS3(file): Promise<string> {
    const key = `restream/${cuid()}.${file.extname}`
    await file.moveToDisk(key, { ACL: 'public-read' }, 's3')
    return key
  }

  static async deleteFromS3(path: string): Promise<void> {
    await drive.use('s3').delete(path)
  }
}
