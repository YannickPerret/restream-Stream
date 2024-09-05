import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Product from '#models/product'

export default class ProductSeeder extends BaseSeeder {
  async run() {
    await Product.createMany([
      {
        title: 'Starter',
        monthlyPrice: 9,
        annualPrice: 100,
        directDiscount: 16,
        labelFeatures: ['Basic invoicing', 'Easy to use accounting', 'Multi-accounts'],
        isActive: true,
        showOnHomepage: true,
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
      }
    ])
  }
}
