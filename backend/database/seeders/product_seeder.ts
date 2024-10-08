import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Product from '#models/product'
import Feature from '#models/feature'

export default class ProductSeeder extends BaseSeeder {
  async run() {

    const logoPath = 'products/figig6jiu30ljj4awphmv2br.svg'

    const products = await Product.createMany([
      {
        title: 'Starter',
        monthlyPrice: 9,
        annualPrice: 100,
        directDiscount: 16,
        labelFeatures: ["**1 Stream**: Start broadcasting with ease","**220GB Storage**: Plenty of space for your content","**1 Customizable Overlay**: Personalize your stream’s look", "**Basic Analytics**: Track your stream’s performance."],
        isActive: true,
        showOnHomepage: true,
        productGroupId: 1,
        logoPath,
      },
      {
        title: 'Scale',
        monthlyPrice: 39,
        annualPrice: 430,
        directDiscount: 16,
        labelFeatures: ["**3 Streams**: Manage multiple broadcasts effortlessly.","**5 Customizable Overlays**: Create visually stunning streams.","**Stream Scheduling**: Automate your broadcast timings for continuous engagement.","**550GB Storage**: Never run out of space for your growing content.","**Chat Bots for YouTube","Twitch","TikTok**: Boost engagement with interactive bots.","**Discord Bot**: Keep your community active.","**Advanced Analytics**: Gain deep insights to optimize your streams."],
        isActive: true,
        showOnHomepage: true,
        productGroupId: 1,
        logoPath,
      },
      {
        title: 'Growth',
        monthlyPrice: 99,
        annualPrice: 1000,
        directDiscount: 16,
        labelFeatures: [
          'Basic invoicing',
          'Easy to use accounting',
          'Multi-accounts',
          'Tax planning toolkit',
        ],
        isActive: true,
        showOnHomepage: true,
        productGroupId: 1,
        logoPath,
      },
    ])

    // Récupération des features existantes
    const qualityFeature = await Feature.findByOrFail('name', 'quality')
    const maxStreamInstancesFeature = await Feature.findByOrFail('name', 'max_stream_instances')
    const bitrateFeature = await Feature.findByOrFail('name', 'bitrate')

    // Attacher les features aux produits avec des valeurs spécifiques
    for (const product of products) {
      switch (product.title) {
        case 'Starter':
          await product.related('features').attach({
            [qualityFeature.id]: { value: '720p' },
            [maxStreamInstancesFeature.id]: { value: '1' },
            [bitrateFeature.id]: { value: '4500k' },
          })
          break
        case 'Scale':
          await product.related('features').attach({
            [qualityFeature.id]: { value: '1080p' },
            [maxStreamInstancesFeature.id]: { value: '3' },
            [bitrateFeature.id]: { value: '4500k' },
          })
          break
        case 'Growth':
          await product.related('features').attach({
            [qualityFeature.id]: { value: '720p30' },
            [maxStreamInstancesFeature.id]: { value: '5' },
            [bitrateFeature.id]: { value: '6000k' },
          })
          break
        default:
          break
      }
    }
  }
}
