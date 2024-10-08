import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_discounts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('order_id').unsigned().notNullable().references('orders.id').onDelete('CASCADE')
      table.integer('discount_id').unsigned().notNullable().references('discounts.id').onDelete('CASCADE')
      table.enum('scope', ['product', 'order']).notNullable().defaultTo('order')
      table
        .integer('product_id')
        .unsigned()
        .nullable()
        .references('products.id')
        .onDelete('CASCADE')
      table.float('applied_amount', 12, 2).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
