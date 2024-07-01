import type { HttpContext } from '@adonisjs/core/http'
import Provider from '#models/providers/provider'
import Timeline from '#models/timeline'
import Playlist from '#models/playlist'

export default class SearchesController {
  async index({ request, response }: HttpContext) {
    const searchType = request.input('domain', '')
    const searchTerms = request.input('query', '')

    let results: any[] = []

    switch (searchType) {
      case 'videos':
        //results = await Video.query().where('title', 'LIKE', `%${searchTerms}%`)
        break
      case 'games':
        //results = await Game.query().where('name', 'LIKE', `%${searchTerms}%`)
        break
      case 'playlists':
        results = await Playlist.query().where('title', 'LIKE', `%${searchTerms}%`)
        break
      case 'timelines':
        results = await Timeline.query().where('title', 'LIKE', `%${searchTerms}%`)
        break
      case 'providers':
        results = await Provider.query().where('name', 'LIKE', `%${searchTerms}%`)
        break
    }

    return response.json({ results })
  }
}
