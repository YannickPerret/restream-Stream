import type { HttpContext } from '@adonisjs/core/http'
import Timeline from '#models/timeline'
import TimelineItem from '#models/timeline_item'
import logger from '@adonisjs/core/services/logger'

export default class TimelinesController {
  /**
   * Display a list of resource
   */
  async index({ auth, response }: HttpContext) {
    const user = await auth.authenticate()
    let timelines = await Timeline.query().preload('items').where('user_id', user.id)

    if (!timelines) {
      return response.json([])
    }

    const timelinesWithVideos = await Promise.all(
      timelines.map(async (timeline: any) => {
        const videos = await timeline.getItemsWithVideos()
        return {
          ...timeline.toJSON(),
          videos,
        }
      })
    )

    return response.json(timelinesWithVideos)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const { title, description, items } = request.all()

    const timeline = await Timeline.create({
      title,
      filePath: '',
      description,
      userId: user.id,
    })

    if (items) {
      for (const [index, item] of items.entries()) {
        if (item.type === 'video' || item.type === 'playlist') {
          await TimelineItem.create({
            timelineId: timeline.id,
            type: item.type,
            itemId: item.itemId,
            order: index + 1,
          })
        } else {
          logger.warn(`Invalid item type: ${item.type}`)
        }
      }

      await timeline.generatePlaylistFile('m3u8')
      await timeline.save()
    }

    return response.created(timeline)
  }

  /**
   * Show individual record
   */
  async show({ params, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    let timeline = await Timeline.query()
      .preload('items')
      .preload('user')
      .where('id', params.id)
      .andWhere('user_id', user.id)
      .firstOrFail()

    const videos = await timeline.getItemsWithVideos()

    const timelineWithVideos = {
      ...timeline.toJSON(),
      videos,
    }

    return response.json(timelineWithVideos)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const timeline = await Timeline.findOrFail(params.id)
    if (timeline.userId !== user.id) {
      return response.forbidden('You are not authorized to update this timeline')
    }

    const { title, description, isPublished, showInLive, items } = request.all()

    // Update timeline properties
    timeline.merge({
      title,
      description,
      isPublished,
      showInLive,
    })

    // Delete old items
    await timeline.related('items').query().delete()

    // Add new items
    if (items) {
      for (const [index, item] of items.entries()) {
        if (item.type === 'video' || item.type === 'playlist') {
          await TimelineItem.create({
            timelineId: timeline.id,
            type: item.type,
            itemId: item.itemId,
            order: index + 1,
          })
        } else {
          logger.warn(`Invalid item type: ${item.type}`)
        }
      }
    }

    await timeline.generatePlaylistFile('m3u8')
    await timeline.save()

    return response.json(timeline)
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = await auth.authenticate()
    const timeline = await Timeline.findOrFail(params.id)
    if (timeline.userId !== user.id) {
      return response.forbidden('You are not authorized to delete this timeline')
    }

    await timeline.delete()
    return response.noContent()
  }
}
