import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Product from '#models/product'
import Feature from '#models/feature'

export default class ProductSeeder extends BaseSeeder {
  async run() {
    const products = await Product.createMany([
      {
        title: 'Starter',
        monthlyPrice: 9,
        annualPrice: 100,
        directDiscount: 16,
        labelFeatures: ['Basic invoicing', 'Easy to use accounting', 'Multi-accounts'],
        isActive: true,
        showOnHomepage: true,
        productGroupId: 1,
      },
      {
        title: 'Scale',
        monthlyPrice: 39,
        annualPrice: 430,
        directDiscount: 16,
        labelFeatures: [
          'Advanced invoicing',
          'Easy to use accounting',
          'Multi-accounts',
          'Tax planning toolkit',
          'VAT & VATMOSS filing',
          'Free bank transfers',
        ],
        isActive: true,
        showOnHomepage: true,
        productGroupId: 1,
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
