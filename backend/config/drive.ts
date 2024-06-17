import {DriveManager} from 'flydrive'
import { FSDriver } from 'flydrive/drivers/fs'
import { S3Driver } from 'flydrive/drivers/s3'
import app from "@adonisjs/core/services/app";
/**
 * Step 1. Define a collection of drivers you plan to use
 */
export const drive = new DriveManager({
  default: 'fs',
  services: {
    fs: () =>
      new FSDriver({
        location: new URL(app.publicPath('uploads'), import.meta.url),
        visibility: 'public',
      }),
    s3: () => new S3Driver({
      endpoint: 'https://coffee-stream.fra1.cdn.digitaloceanspaces.com',
      region: 'fra1',
      bucket: 'coffee-stream',
      visibility:'private',
    })
  },
})

