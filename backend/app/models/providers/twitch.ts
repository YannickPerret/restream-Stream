import Provider from '#models/providers/provider'

export default class Twitch extends Provider {
  private static instance: Twitch

  constructor(provider: Provider) {
    super()
    Object.assign(this, provider)
    this.baseUrl = 'rtmp://live.twitch.tv/app'
  }

  async changeTitle(title: String | undefined = undefined) {
    if (!title) {
      return
    }

    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/channels?broadcaster_id=${this.broadcasterId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.authBearer}`,
            'Client-ID': this.clientId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        }
      )

      if (!response.ok) {
        const errorDetails = await response.json()
        console.error('Failed to change title:', errorDetails)
        await this.verifyToken()

        throw new Error('Failed to change title')
      }

      console.log('Title changed successfully')
    } catch (error) {
      console.error('Error changing title:', error)
      throw new Error('Failed to change title')
    }
  }

  async changeCategory(categoryId: String) {
    const response = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${this.broadcasterId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${this.authBearer}`,
      },
      body: JSON.stringify({ game_id: categoryId }),
    });
    if (!response.ok) {
      return new Error('Failed to change category');
    }
    return response.json();
  }

  async changeStreamNotification(message: String) {
    const response = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${this.broadcasterId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${this.authBearer}`,
      },
      body: JSON.stringify({ status: message }),
    });
    if (!response.ok) {
      return new Error('Failed to change stream notification');
    }
    return response.json()
  }

  private async verifyToken() {
    try {
      const response = await fetch('https://id.twitch.tv/oauth2/validate', {
        headers: {
          Authorization: `Bearer ${this.authBearer}`,
        },
      })
      const data = await response.json()
      if (!data.status || data.status === 401) {
        console.log('Token is invalid, refreshing token...')
        await this.refreshToken()
      } else {
        console.log('Token scopes:', data.scopes)
      }
    } catch (error) {
      console.error('Failed to verify token:', error)
    }
  }

  private async refreshToken() {
    try {
      const response = await fetch(`https://id.twitch.tv/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      if (!response.ok) {
        const errorDetails = await response.json()
        console.error('Failed to refresh token:', errorDetails)
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()
      this.authBearer = data.access_token
      await this.save()
      console.log('Token refreshed successfully')
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw new Error('Failed to refresh token')
    }
  }

  static getInstance(): Twitch {
    if (!Twitch.instance) {
      Twitch.instance = new Twitch()
    }
    return Twitch.instance
  }
}
