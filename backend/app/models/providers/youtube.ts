import Provider from '#models/providers/provider'

export default class Youtube extends Provider {
  private static instance: Youtube

  constructor(provider: Provider) {
    super()
    Object.assign(this, provider)
    this.baseUrl = 'https://www.googleapis.com/youtube/v3'
  }

  async changeTitle(title: String) {
    try {
      const response = await fetch(`${this.baseUrl}/liveBroadcasts?part=snippet&id=${this.broadcasterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          id: this.broadcasterId,
          snippet: {
            title: title,
          },
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.json()
        console.error('Failed to change title:', errorDetails)
        throw new Error('Failed to change title')
      }

      console.log('Title changed successfully')
      return response.json()
    } catch (error) {
      console.error('Error changing title:', error)
      throw new Error('Failed to change title')
    }
  }

  async changeCategory(categoryId: String) {
    try {
      const response = await fetch(`${this.baseUrl}/liveBroadcasts?part=snippet&id=${this.broadcasterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          id: this.broadcasterId,
          snippet: {
            categoryId: categoryId,
          },
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.json()
        console.error('Failed to change category:', errorDetails)
        throw new Error('Failed to change category')
      }

      console.log('Category changed successfully')
      return response.json()
    } catch (error) {
      console.error('Error changing category:', error)
      throw new Error('Failed to change category')
    }
  }

  async changeStreamNotification(message: String) {
    try {
      const response = await fetch(`${this.baseUrl}/liveBroadcasts?part=snippet&id=${this.broadcasterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          id: this.broadcasterId,
          snippet: {
            description: message,
          },
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.json()
        console.error('Failed to change stream notification:', errorDetails)
        throw new Error('Failed to change stream notification')
      }

      console.log('Stream notification changed successfully')
      return response.json()
    } catch (error) {
      console.error('Error changing stream notification:', error)
      throw new Error('Failed to change stream notification')
    }
  }

  static getInstance(): Youtube {
    if (!Youtube.instance) {
      Youtube.instance = new Youtube()
    }
    return Youtube.instance
  }
}
