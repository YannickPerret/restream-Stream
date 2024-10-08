import scheduler from 'adonisjs-scheduler/services/main'
import app from '@adonisjs/core/services/app'
import ace from '@adonisjs/core/services/ace'
import Subscription from '#models/subscription'



/************** SUBSCRIPTIONS **************/
scheduler
  .call(async () => {
    const subscriptions = await Subscription.findManyBy('isActive', true)
    for (const subscription of subscriptions) {
      if (await subscription.isExpiringSoon(subscription.frequency === 'monthly' ? 15 : 60)) {
        await subscription.createRenewalOrder()
      }

      if (await subscription.isExpiringSoon(10)) {
        await subscription.sendExpirationReminder()
      }

      if (await subscription.isExpiringSoon(2)) {
        await subscription.sendExpirationReminder()
      }

      if (await subscription.isExpired()) {
        await subscription.cancel()
      }
    }
  })
  .daily()


/************** Do not edit below this line **************/
if (app.getEnvironment() === 'web') {
  await ace.boot()

  const command = await ace.exec('scheduler:run', [])

  app.terminating(async () => {
    await command.terminate()
  })
}
