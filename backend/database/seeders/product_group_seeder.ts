import { BaseSeeder } from '@adonisjs/lucid/seeders'
import ProductGroup from "#models/product_group";

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await ProductGroup.createMany([
      {
        name: '2024-web',
        multiple: false,
      },
      {
        name: '2024-bot',
        multiple: true,
      },
    ])
  }
}
