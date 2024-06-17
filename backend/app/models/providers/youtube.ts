import Provider from '#models/provider'

export default class Youtube extends Provider {
  private static instance: Youtube

  constructor(provider: Provider) {
    super()
    Object.assign(this, provider)
    this.baseUrl = 'rtmp://live.twitch.tv/app'
  }

  async changeTitle(title:String) {
    const response = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${this.broadcasterId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ title: title }),
    });
    if (!response.ok) {
      return new Error('Failed to change title');
    }
    return response.json();
  }

  async changeCategory(categoryId: String) {
    const response = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${this.broadcasterId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Client-ID': this.clientId,
        'Authorization': `Bearer ${this.accessToken}`,
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
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ status: message }),
    });
    if (!response.ok) {
      return new Error('Failed to change stream notification');
    }
    return response.json();
  }

  static getInstance(): Youtube {
    if (!Youtube.instance) {
      Youtube.instance = new Youtube()
    }
    return Youtube.instance
  }
}
