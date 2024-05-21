import { defineConfig } from '@adonisjs/transmit'
import { middleware } from '#start/kernel'

export default defineConfig({
  pingInterval: '10s',
  transport: null,

  /*routeHandlerModifier(route) {
    // Ensure you are authenticated to register your client
    if (route.getPattern() === '/__transmit/events') {
      route.middleware(middleware.auth())
      return
    }
  },*/
})
