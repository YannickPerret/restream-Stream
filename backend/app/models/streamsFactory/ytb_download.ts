import ytdl from '@distube/ytdl-core'
import Asset from '#models/asset'

export interface YtbDownload {
  download(url: string): Promise<string>
  downloadPlaylist(playlistUrl: string): Promise<string[]>
  handleDownload(url: string): Promise<string | string[]>
  getVideoInfo(url: string): Promise<any>
}

export default class YtDdownload implements YtbDownload {
  static async download(url: string): Promise<string> {
    try {
      // Valider si l'URL YouTube est correcte
      if (!ytdl.validateURL(url)) {
        throw new Error('Invalid YouTube URL')
      }

      // Télécharger la vidéo via ytdl-core (en stream)
      const videoStream = ytdl(url, {
        filter: 'audioandvideo',
        quality: 'highestvideo',
      })

      // Définir l'extension du fichier
      const extname = 'mp4' // Par défaut, on télécharge en .mp4

      // Utiliser la méthode `uploadToS3` du modèle `Asset` pour uploader directement le flux sur S3
      const s3Path = await Asset.uploadStreamToS3(videoStream, `video/${extname}`)

      console.log(`Video downloaded and uploaded to S3 successfully: ${s3Path}`)
      return s3Path
    } catch (error) {
      console.error(`Error downloading video: ${error.message}`)
      throw error
    }
  }

  static async downloadPlaylist(playlistUrl: string): Promise<string[]> {
    try {
      // Valider si l'URL de la playlist est correcte
      if (!playlistUrl.includes('list=')) {
        throw new Error('Invalid playlist URL')
      }

      // Extraire les IDs des vidéos de la playlist
      const videoUrls = await this.extractPlaylistVideoUrls(playlistUrl)

      const s3Paths: string[] = []
      for (const url of videoUrls) {
        const s3Path = await this.download(url)
        s3Paths.push(s3Path)
      }

      return s3Paths
    } catch (error) {
      console.error(`Error downloading playlist: ${error.message}`)
      throw error
    }
  }

  static async handleDownload(urlOrPlaylist: string): Promise<string | string[]> {
    if (urlOrPlaylist.includes('playlist?list=')) {
      // Si l'URL est une playlist
      return await this.downloadPlaylist(urlOrPlaylist)
    } else {
      // Sinon, c'est une vidéo simple
      return await this.download(urlOrPlaylist)
    }
  }

  static async getVideoInfo(url: string): Promise<any> {
    try {
      if (!ytdl.validateURL(url)) {
        throw new Error('Invalid YouTube URL')
      }
      return await ytdl.getBasicInfo(url)
    } catch (error) {
      console.error(`Error getting video info: ${error.message}`)
      throw error
    }
  }

  static async extractPlaylistVideoUrls(playlistUrl: string): Promise<string[]> {
    try {
      // Récupérer le contenu HTML de la playlist pour extraire les URLs des vidéos
      const response = await axios.get(playlistUrl)
      const html = response.data

      // Extraire les URLs des vidéos via une expression régulière
      const videoUrls: string[] = []
      const videoIdPattern = /"videoId":"([a-zA-Z0-9_-]{11})"/g
      let match
      while ((match = videoIdPattern.exec(html)) !== null) {
        const videoId = match[1]
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
        videoUrls.push(videoUrl)
      }

      if (videoUrls.length === 0) {
        throw new Error('No videos found in the playlist.')
      }

      return videoUrls
    } catch (error) {
      console.error(`Error extracting video URLs from playlist: ${error.message}`)
      throw error
    }
  }
}
