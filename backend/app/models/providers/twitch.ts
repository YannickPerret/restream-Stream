import logger from '@adonisjs/core/services/logger'
import Provider from '#models/provider'

export default class Twitch extends Provider {
  private static instance: Twitch

  constructor(provider: Provider) {
    super()
    Object.assign(this, provider)
    this.baseUrl = 'rtmp://live.twitch.tv/app'
  }

  static getInstance(): Twitch {
    if (!Twitch.instance) {
      Twitch.instance = new Twitch()
    }
    return Twitch.instance
  }
}
