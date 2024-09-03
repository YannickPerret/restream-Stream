import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.integer('monthly_price').notNullable()
      table.integer('annual_price').notNullable()
      table.integer('direct_discount').nullable()
      table.json('features').notNullable()
      table.boolean('is_active').defaultTo(true)
      table.boolean('show_on_homepage').defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
