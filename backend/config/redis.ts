import env from '#start/env'
import { defineConfig } from '@adonisjs/redis'
import { InferConnections } from '@adonisjs/redis/types'

const redisConfig = defineConfig({
  connection: 'main',

  connections: {
    /*
    |--------------------------------------------------------------------------
    | The default connection
    |--------------------------------------------------------------------------
    |
    | The main connection you want to use to execute redis commands. The same
    | connection will be used by the session provider, if you rely on the
    | redis driver.
    |
    */
    main: {
      host: '127.0.0.1', // Adresse de Redis en local
      port: 6379,
      password: env.get('REDIS_PASSWORD', ''),
      db: 0,
      keyPrefix: '',
      retryStrategy(times) {
        return times > 10 ? null : times * 50
      },
    },
  },
})

export default redisConfig

declare module '@adonisjs/redis/types' {
  export interface RedisConnections extends InferConnections<typeof redisConfig> {}
}
