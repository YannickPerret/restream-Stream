import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import Provider from '#models/provider'
import Timeline from '#models/timeline'

export default class SearchesController {
  async index({ request, response }: HttpContext) {
    const searchType = request.input('domain', '')
    const searchTerms = request.input('query', '')
    logger.info(`Searching for ${searchType} with query: ${searchTerms}`)

    let results: any[] = []

    switch (searchType) {
      case 'videos':
        //results = await Video.query().where('title', 'LIKE', `%${searchTerms}%`)
        break
      case 'games':
        //results = await Game.query().where('name', 'LIKE', `%${searchTerms}%`)
        break
      case 'playlists':
        //results = await Playlist.query().where('title', 'LIKE', `%${searchTerms}%`)
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
