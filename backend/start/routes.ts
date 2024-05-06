/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import Stream_manager from '#models/stream_manager'
const ProviderController = () => import('#controllers/providers_controller')
const StreamsController = () => import('#controllers/streams_controller')
const AuthController = () => import('#controllers/auth_controller')

router.get('/', async ({ response }) => response.ok({ uptime: Math.round(process.uptime()) }))

router
  .group(() => {
    router
      .group(() => {
        router.post('register', [AuthController, 'register'])
        router.post('login', [AuthController, 'login'])
        router.post('logout', [AuthController, 'logout']).use(middleware.auth())
      })
      .prefix('auth')

    router
      .group(() => {
        router.get('/', [StreamsController, 'index'])
        router.post('/', [StreamsController, 'store'])
        router.post(':id/start', [StreamsController, 'start'])
        router.post(':id/stop', [StreamsController, 'stop'])
        router.delete(':id', [StreamsController, 'destroy'])
      })
      .prefix('streams')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [ProviderController, 'index'])
        router.post('/', [ProviderController, 'store'])
        router.delete(':id', [ProviderController, 'destroy'])
        router.get(':id', [ProviderController, 'show'])
      })
      .prefix('providers')
      .use(middleware.auth())

    router.group(() => {
      router.get('streamManager', ({ response }) => {
        const streamManager = Stream_manager
        return response.ok({ streams: streamManager.getAllStreams() })
      })
    })
  })
  .prefix('api')
