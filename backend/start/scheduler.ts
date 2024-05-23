import scheduler from 'adonisjs-scheduler/services/main'
import logger from '@adonisjs/core/services/logger'
import Stream_manager from '#models/stream_manager'
import app from '@adonisjs/core/services/app'
import ace from '@adonisjs/core/services/ace'

scheduler
  .call(async () => {
    const streamManager = Stream_manager.getAllStreams()
    for (const stream of streamManager) {
      if (stream.isOnLive) {
        logger.info(`Update crypto in stream ${stream.id}`)
        await stream.updateCryptoText()
      }
    }
  })
  .everyFifteenMinutes()

/*
 23 May 2024 - Perret - Code to start the scheduler when server up by Tom Gobich https://discord.com/channels/423256550564691970/423256550564691972/1242858943185682586
 */

if (app.getEnvironment() === 'web') {
  // boot ace, if already running it will ignore
  await ace.boot()

  // start the command
  const command = await ace.exec('scheduler:run', [])

  // stop the command when the app is terminating
  app.terminating(async () => {
    await command.terminate()
  })
}
