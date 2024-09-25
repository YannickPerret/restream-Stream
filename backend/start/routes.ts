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
import app from '@adonisjs/core/services/app'
import * as fs from 'node:fs'
const UserAdminsController = () => import('#controllers/admin/user_admins_controller')
const OrderAdminsController = () => import('#controllers/admin/order_admins_controller')
const SubscriptionAdminsController = () =>
  import('#controllers/admin/subscription_admins_controller')
const StreamSchedulesController = () => import('#controllers/stream_schedules_controller')
const ProductsController = () => import('#controllers/products_controller')
const OrdersController = () => import('#controllers/orders_controller')
const SubscriptionsController = () => import('#controllers/subscriptions_controller')
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

    router
      .group(() => {
        router.get('/', [ProductsController, 'index'])
        router.get(':id', [ProductsController, 'show'])
        router.post('/', [ProductsController, 'store'])
        router.put(':id', [ProductsController, 'update'])
      })
      .prefix('products')

    router
      .group(() => {
        router
          .group(() => {
            router.get('current-user', [AuthController, 'currentUser'])
          })
          .prefix('auth')

        router
          .group(() => {
            router
              .group(() => {
                router.get('/', [StreamSchedulesController, 'index'])
                router.post('/', [StreamSchedulesController, 'create'])
              })
              .prefix('schedules')

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

        router.group(() => {}).prefix('payments')

        router
          .group(() => {
            router.get('/', [OrdersController, 'index'])
            router.post('/', [OrdersController, 'store'])
            router.get(':id', [OrdersController, 'show'])
          })
          .prefix('orders')

        router
          .group(() => {
            router.post('/', [SubscriptionsController, 'store'])
            router.get('/', [SubscriptionsController, 'index'])
            router.get(':id', [SubscriptionsController, 'show'])
            router.put(':id', [SubscriptionsController, 'update'])
            router.post(':id/renew', [SubscriptionsController, 'renew'])
            router.post(':id/revoke', [SubscriptionsController, 'revoke'])
          })
          .prefix('subscriptions')

        router
          .group(() => {
            router.get('/', [SearchesController, 'index'])
          })
          .prefix('search')

        /********* ADMIN ROUTE **********/
        router
          .group(() => {
            router.get('subscriptions', [SubscriptionAdminsController, 'index'])

            router
              .group(() => {
                router.get('/', [OrderAdminsController, 'index'])
                router.post('/', [OrderAdminsController, 'store'])
                router.get('/:id', [OrderAdminsController, 'show'])
                router.put('/:id', [OrderAdminsController, 'update'])
                router.delete('/:id', [OrderAdminsController, 'destroy'])
              })
              .prefix('orders')

            router
              .group(() => {
                router.get('/', [UserAdminsController, 'index'])
                router.delete(':id', [UserAdminsController, 'destroy'])
              })
              .prefix('users')
          })
          .prefix('admin')
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
