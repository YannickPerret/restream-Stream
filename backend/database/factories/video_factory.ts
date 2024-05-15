import factory from '@adonisjs/lucid/factories'
import Video from '#models/video'

export const VideoFactory = factory
  .define(Video, async ({ faker }) => {
    return {
      title: faker.lorem.words(10),
      description: faker.lorem.sentence(),
      path: faker.system.filePath(),
      duration: faker.number.int({ min: 1, max: 1000 }),
      isPublished: true,
      showInLive: true,
    }
  })
  .build()
