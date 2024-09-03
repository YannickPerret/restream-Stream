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
import app from '@adonisjs/core/services/app'
import * as fs from 'node:fs'
import ProductsController from "#controllers/products_controller";
import PaymentsController from "#controllers/payments_controller";
const HealthChecksController = () => import('#controllers/health_checks_controller')
const TimelinesController = () => import('#controllers/timelines_controller')
const PlaylistsController = () => import('#controllers/playlists_controller')
const VideosController = () => import('#controllers/videos_controller')
const SearchesController = () => import('#controllers/searches_controller')
const ProviderController = () => import('#controllers/providers_controller')
const StreamsController = () => import('#controllers/streams_controller')
const AuthController = () => import('#controllers/auth_controller')

router.get('/', async ({ response }) => response.ok({ uptime: Math.round(process.uptime()) }))
router.get('/health', [HealthChecksController])

router
  .group(() => {
    router
      .group(() => {
        router.post('register', [AuthController, 'register'])
        router.post('login', [AuthController, 'login'])
        router.post('logout', [AuthController, 'logout']).use(middleware.auth())
        router.post('refresh', [AuthController, 'refreshToken'])
        router.post('forgot-password', [AuthController, 'resetPassword'])
        router.post('verify-account', [AuthController, 'verify'])
      })
      .prefix('auth')

    router.group(() => {
      router.get('/', [ProductsController, 'index'])
      router.get(':id', [ProductsController, 'show'])
    }).prefix('products')

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', [StreamsController, 'index'])
            router.post('/', [StreamsController, 'store'])
            router.get(':id', [StreamsController, 'show'])
            router.put(':id', [StreamsController, 'update'])
            router.post(':id/start', [StreamsController, 'start'])
            router.post(':id/stop', [StreamsController, 'stop'])
            router.delete(':id', [StreamsController, 'destroy'])
          })
          .prefix('streams')

        router
          .group(() => {
            router.get('/', [ProviderController, 'index'])
            router.post('/', [ProviderController, 'store'])
            router.delete(':id', [ProviderController, 'destroy'])
            router.get(':id', [ProviderController, 'show'])
            router.put(':id', [ProviderController, 'update'])
          })
          .prefix('providers')

        router
          .group(() => {
            router.get('/', [VideosController, 'index'])
            router.post('/', [VideosController, 'store'])
            router.get(':id', [VideosController, 'show'])
            router.put(':id', [VideosController, 'update'])
            router.delete(':id', [VideosController, 'destroy'])
            router.post(':id/validate', [VideosController, 'validate'])
          })
          .prefix('videos')

        router
          .group(() => {
            router.get('/', [PlaylistsController, 'index'])
            router.post('/', [PlaylistsController, 'store'])
            router.get(':id', [PlaylistsController, 'show'])
            router.put(':id', [PlaylistsController, 'update'])
            router.delete(':id', [PlaylistsController, 'destroy'])
          })
          .prefix('playlists')

        router
          .group(() => {
            router.get('/', [TimelinesController, 'index'])
            router.post('/', [TimelinesController, 'store'])
            router.get(':id', [TimelinesController, 'show'])
            router.put(':id', [TimelinesController, 'update'])
            router.delete(':id', [TimelinesController, 'destroy'])
            router.post(':id/generate', [TimelinesController, 'generateNewTimeline'])
          })
          .prefix('timelines')

        router.group(() => {
          router.post('/create', [PaymentsController, 'createPaymentIntent'])
        }).prefix('payments')
        router
          .group(() => {
            router.get('streamManager', ({ response }) => {
              const streamManager = Stream_manager
              return response.ok({ streams: streamManager.getAllStreams() })
            })
          })
          .prefix('admin')

        router.group(() => {
          router.get('/search', [SearchesController, 'index'])
        })
      })
      .use(middleware.auth())
  })
  .prefix('api')

router.group(() => {
  router.get('videos/:id/serve', [VideosController, 'serve'])
  router.get('/images/*', async ({ params, response }) => {
    const filePath = app.publicPath(...params['*'])
    const exists = fs.existsSync(filePath)
    if (exists) {
      response.header('Content-Type', 'image/jpeg')
      const imageStream = fs.createReadStream(filePath)
      return response.stream(imageStream)
    } else {
      return response.status(404).send('File not found')
    }
  })
})
