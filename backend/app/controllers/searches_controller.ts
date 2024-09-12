import type { HttpContext } from '@adonisjs/core/http'
import Provider from '#models/providers/provider'
import Timeline from '#models/timeline'
import Playlist from '#models/playlist'
import User from "#models/user";
import Product from "#models/product";

export default class SearchesController {
  async index({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const searchType = request.input('domain', '')
    const searchTerms = request.input('query', '')

    let results: any[] = []

    switch (searchType) {
      case 'videos':
        //results = await Video.query().where('title', 'LIKE', `%${searchTerms}%`)
        break
      case 'playlists':
        results = await Playlist.query().where('title', 'LIKE', `%${searchTerms}%`).andWhere('userId', '=', user.id)
        break
      case 'timelines':
        results = await Timeline.query().where('title', 'LIKE', `%${searchTerms}%`).andWhere('userId', '=', user.id)
        break
      case 'providers':
        results = await Provider.query().where('name', 'LIKE', `%${searchTerms}%`).andWhere('userId', '=', user.id)
        break
      case 'users':
        results = await User.query()
          .where('username', 'LIKE', `%${searchTerms}%`)
          .orWhere('email', 'LIKE', `%${searchTerms}%`)
        break
      case 'products':
        results = await Product.query().where('title', 'LIKE', `%${searchTerms}%`)
        break
      default:
        results = []
        break
    }

    return response.json({ results })
  }
}
