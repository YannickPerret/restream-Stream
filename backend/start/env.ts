/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  VIDEO_DIRECTORY: Env.schema.string(),
  VIDEO_PROCESSING_DIRECTORY: Env.schema.string(),
  VIDEO_GUEST_PENDING_DIRECTORY: Env.schema.string(),
  TIMELINE_PLAYLIST_DIRECTORY: Env.schema.string(),
  FRONTEND_URL: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the mail package
  |----------------------------------------------------------
  */
  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.number(),
  SMTP_USERNAME: Env.schema.string(),
  SMTP_PASSWORD: Env.schema.string(),

  RESEND_API_KEY: Env.schema.string(),

  LOGO_DIRECTORY: Env.schema.string(),
  OVERLAY_DIRECTORY: Env.schema.string(),

  OD_ACCESS_KEY_ID: Env.schema.string(),
  OD_SECRET_ACCESS_KEY: Env.schema.string(),

  DRIVE_DISK: Env.schema.enum(['fs'] as const),
})
