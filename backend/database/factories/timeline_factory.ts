import factory from '@adonisjs/lucid/factories'
import Timeline from '#models/timeline'
import { UserFactory } from '#database/factories/user_factory'

export const TimelineFactory = factory
  .define(Timeline, async ({ faker }) => {
    return {
      title: faker.lorem.words(10),
      description: faker.lorem.sentence(),
      filePath: faker.system.filePath(),
      isPublished: true,
    }
  })
  .relation('user', () => UserFactory)
  .relation('items', () => TimelineItemFactory)
  .build()
