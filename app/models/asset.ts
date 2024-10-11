import drive from '@adonisjs/drive/services/main'

export default class Asset {
  static async getPublicUrl(path: string): Promise<string> {
    try {
      const baseUrl = await drive.use('s3').getUrl(path)

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
}
