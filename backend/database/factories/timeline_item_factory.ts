import factory from '@adonisjs/lucid/factories'
import TimelineItem from '#models/timeline_item'
import { VideoFactory } from '#database/factories/video_factory'
import { PlaylistFactory } from '#database/factories/playlist_factory'

export const TimelineItemFactory = factory
  .define(TimelineItem, async ({ faker }) => {
    const type = faker.helpers.arrayElement(['Video', 'Playlist'])
    let item
    if (type === 'Video') {
      item = await VideoFactory.create()
    } else {
      item = await PlaylistFactory.create()
    }
    const itemId = item.id

    return {
      type,
      itemId,
      order: faker.number.int({ min: 1, max: 100 }),
    }
  })
  .build()
