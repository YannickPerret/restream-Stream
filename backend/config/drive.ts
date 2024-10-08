import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK', 'fs'),

  services: {
    fs: services.fs({
      location: app.makePath('storage'),
      visibility: 'public',
      routeBasePath: '/uploads',
      appUrl: env.get('APP_URL'),
      serveFiles: true,
    }),

    s3: services.s3({
      credentials: {
        accessKeyId: env.get('S3_ACCESS_KEY_ID'),
        secretAccessKey: env.get('S3_SECRET_ACCESS_KEY'),
      },
      region: env.get('S3_REGION'),
      bucket: env.get('S3_BUCKET'),
      endpoint: env.get('S3_ENDPOINT'),
      visibility: 'private',
      forcePathStyle: true,
    }),
  },
})

export default driveConfig
