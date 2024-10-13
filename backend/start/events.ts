import emitter from '@adonisjs/core/services/emitter'
import Stream from '#models/stream'
import Provider from '#models/providers/provider'
import logger from '@adonisjs/core/services/logger'
import transmit from '@adonisjs/transmit/services/main'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'stream:onNextVideo': Stream | number
  }
}

emitter.on('stream:onNextVideo', async function (streamId: number | Stream) {
  // Fetch the stream by its ID
  const stream = await Stream.query()
    .where('id', streamId)
    .andWhere('status', 'active')
    .firstOrFail()

  // Load associated relationships
  await stream.load('providers')
  await stream.load('timeline')
  await stream.load('user')

  // Fetch the current video from the timeline
  const currentVideo = await stream.timeline.getCurrentVideo(stream.currentIndex)

  // If a video is found and should be shown live, update provider titles
  if (currentVideo && currentVideo.showInLive && currentVideo.duration > 55) {
    logger.info(`stream:onNextVideo: ${streamId} - ${currentVideo.title}`)

    // Iterate through all providers and update the title for each
    for (const provider of stream.providers) {
      const providerInstance = await Provider.createProvider(provider)
      await providerInstance.changeTitle(currentVideo.title)
    }
  }

  // Broadcast the current video to the frontend
  if (currentVideo) {
    transmit.broadcast(`streams/${streamId}/currentVideo`, {
      currentVideo: currentVideo.serialize(),
    })
  } else {
    logger.warn(`No current video found for stream ID ${streamId} at index ${stream.currentIndex}`)
  }
})
