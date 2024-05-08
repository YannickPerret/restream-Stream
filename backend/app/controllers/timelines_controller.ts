import type { HttpContext } from '@adonisjs/core/http'
import Timeline from '#models/timeline'
import TimelineItem from '#models/timeline_item'
import logger from '@adonisjs/core/services/logger'

export default class TimelinesController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const { title, description, items } = request.all()

    const timeline = await Timeline.create({
      title,
      description,
      userId: user.id,
    })

    if (items) {
      for (const [index, { type, itemId }] of items.entries()) {
        if (type === 'video' || type === 'playlist') {
          await TimelineItem.create({
            id: timeline.id,
            type: type,
            itemId,
            order: index + 1,
          })
        } else {
          logger.warn(`Invalid item type: ${type}`)
        }
      }
    }

    return response.created(timeline)
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}
