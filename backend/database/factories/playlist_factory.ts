import factory from '@adonisjs/lucid/factories'
import Playlist from '#models/playlist'
import { VideoFactory } from '#database/factories/video_factory'
import { UserFactory } from '#database/factories/user_factory'

export const PlaylistFactory = factory
  .define(Playlist, async ({ faker }) => {
    return {
      title: faker.lorem.words(10),
      description: faker.lorem.sentence(),
      isPublished: true,
    }
  })
  .relation('videos', () => VideoFactory)
  .relation('user', () => UserFactory)
  .build()
