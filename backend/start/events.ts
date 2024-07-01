import emitter from '@adonisjs/core/services/emitter'
import Stream from '#models/stream'
import Provider from '#models/providers/provider'
import logger from '@adonisjs/core/services/logger'
import transmit from "@adonisjs/transmit/services/main";

declare module '@adonisjs/core/types' {
  interface EventsList {
    'stream:onNextVideo': Stream | number
  }
}

emitter.on('stream:onNextVideo', async function (streamId: number | Stream) {
  const stream = await Stream.query()
    .where('id', streamId)
    .andWhere('status', 'active')
    .firstOrFail()
  await stream.load('providers')
  await stream.load('timeline')
  await stream.load('user')
  await stream.updateGuestText()

  const currentVideo = await stream.timeline.getCurrentVideo(stream.currentIndex)
  console.log(currentVideo.showInLive, currentVideo.duration)
  if (currentVideo.showInLive && currentVideo.duration > 55) {
    logger.info(`stream:onNextVideo: ${streamId} - ${currentVideo.title}`)
    for (const provider of stream.providers) {
      const providerLocal = await Provider.createProvider(provider)
      await providerLocal.changeTitle(currentVideo.title)
    }
  }
  if (currentVideo) {
    transmit.broadcast(`streams/${streamId}/currentVideo`, {
      currentVideo: currentVideo.serialize(),
    })
  }
})
