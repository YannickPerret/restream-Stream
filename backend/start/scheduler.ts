import scheduler from 'adonisjs-scheduler/services/main'
import app from '@adonisjs/core/services/app'
import ace from '@adonisjs/core/services/ace'

scheduler
  .call(async () => {
    console.log('Running every hour')
  })
  .everyHours(1)

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
