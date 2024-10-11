/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const StreamsController = () => import('#controllers/streams_controller')
const HealthChecksController = () => import('#controllers/health_checks_controller')

router.get('/', async ({ response }) => response.ok({ uptime: Math.round(process.uptime()) }))
router.get('/health', [HealthChecksController])

router
  .group(() => {
    router.post(':id/start', [StreamsController, 'startStream'])
    router.post(':id/stop', [StreamsController, 'stopStream'])
    router.post(':id/restart', [StreamsController, 'restartStream'])
  })
  .prefix('stream')
