import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Features from '#models/feature'

export default class extends BaseSeeder {
  async run() {
    const features = [{ name: 'quality' }, { name: 'max_stream_instances' }, { name: 'bitrate' }, {name: 'max_video_storage'}]
    await Features.createMany(features)
  }
}
