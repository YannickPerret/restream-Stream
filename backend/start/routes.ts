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
const StreamsController = () => import('#controllers/streams_controller')
const AuthController = () => import('#controllers/auth_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .get('me', async ({ auth, response }) => {
    try {
      const user = auth.getUserOrFail()
      return response.ok(user)
    } catch (error) {
      return response.unauthorized({ error: 'User not found' })
    }
  })
  .use(middleware.auth())

router
  .group(() => {
    router
      .group(() => {
        router.post('register', [AuthController, 'register'])
        router.post('login', [AuthController, 'login'])
        router.post('logout', [AuthController, 'logout'])
      })
      .prefix('auth')

    router
      .group(() => {
        router.get('create', [StreamsController, 'create'])
        router.post('store', [StreamsController, 'store'])
        router.post(':id/start', [StreamsController, 'start'])
        router.post(':id/stop', [StreamsController, 'stop'])
      })
      .prefix('streams')
      .use(middleware.auth())
  })
  .prefix('api')
