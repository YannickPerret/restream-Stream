import Video from '#models/video'
import logger from '@adonisjs/core/services/logger'
import Provider from '#models/provider'
import tmi from 'tmi.js'

export default class Twitch extends Provider {
  private static instance: Twitch
  private client: tmi.Client

  constructor(providerRecord?: Provider) {
    super()
    if (providerRecord) {
      this.id = providerRecord.id
      this.name = providerRecord.name
      this.streamKey = providerRecord.streamKey
      this.authBearer = providerRecord.authBearer
      this.clientId = providerRecord.clientId
      this.clientSecret = providerRecord.clientSecret
      this.refreshToken = providerRecord.refreshToken
      this.accessToken = providerRecord.accessToken
      this.broadcasterId = providerRecord.broadcasterId
      this.onPrimary = providerRecord.onPrimary
    }
    this.baseUrl = 'rtmp://live.twitch.tv/app/'

    this.client = new tmi.Client({
      options: { debug: true },
      connection: {
        secure: true,
        reconnect: true,
      },
      identity: {
        username: 'your-bot-username',
        password: 'oauth:your-oauth-token',
      },
      channels: ['your-channel-name'],
    })
  }

  private BASE_URL_API: string = 'https://api.twitch.tv/helix'

  async changeCategory(gameId: string) {
    try {
      const response = await fetch(
        `${this.BASE_URL_API}/channels?broadcaster_id=${this.broadcasterId}`,
        {
          method: 'PATCH',
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${this.authBearer}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ game_id: gameId }),
        }
      )

      if (!response.ok) {
        const errorBody = await response.text()
        logger.error(`Error changing category: ${errorBody}`)
        await this.refreshTokenWhenExpired().then(() => this.changeCategory(gameId))
      } else {
        logger.info(`Category changed successfully to ${gameId}`)
      }
    } catch (error) {
      logger.error(`Error changing category: ${error.message}`)
    }
  }

  async changeTitle(newTitle: String | undefined = undefined, video: Video) {
    let baseTitle = newTitle
    if (newTitle === undefined) {
      baseTitle = `[FR][VOD] SpeedRunTV - ${video.title} speedrun by @${video.runner.twitch} || !discord`
    }
    try {
      logger.info(
        `${this.BASE_URL_API}/channels?broadcaster_id=${this.broadcasterId} with title [FR][VOD] SpeedRunTV - ${video.title} speedrun by @${video.runner.twitch}`
      )

      const response = await fetch(
        `${this.BASE_URL_API}/channels?broadcaster_id=${this.broadcasterId}`,
        {
          method: 'PATCH',
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${this.authBearer}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newTitle || baseTitle,
          }),
        }
      )
      if (!response.ok) {
        const errorBody = await response.text()
        logger.error(`Error changing title: ${errorBody}`)
        await this.refreshTokenWhenExpired().then(() => this.changeTitle(newTitle, video))
      }
    } catch (error) {
      logger.error(error)
    }
  }
  async changeTags(tags: string[]) {
    try {
      await fetch(`${this.BASE_URL_API}/streams/tags?broadcaster_id=${this.broadcasterId}`, {
        method: 'PUT',
        headers: {
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${this.authBearer}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag_ids: tags,
        }),
      })
    } catch (error) {
      logger.error(error)
    }
  }

  sendChatMessage() {
    client.say('your-channel-name', 'Hello, Twitch chat!')
  }

  async getViewers() {
    await fetch(`${this.BASE_URL_API}/streams?user_id=${this.broadcasterId}`, {
      headers: {
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${this.authBearer}`,
      },
    })
  }

  async refreshTokenWhenExpired() {
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?grant_type=refresh_token&refresh_token=${this.refreshToken}&client_id=${this.clientId}&client_secret=${this.clientSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${data.message}`)
    }

    logger.info('Token refreshed successfully')

    this.authBearer = data.access_token
    this.refreshToken = data.refresh_token

    // Update the record in the database
    await Provider.query().where('id', this.id).update({
      authBearer: this.authBearer,
      refreshToken: this.refreshToken,
    })
  }

  static getInstance(): Twitch {
    if (!Twitch.instance) {
      Twitch.instance = new Twitch()
    }
    return Twitch.instance
  }
}
