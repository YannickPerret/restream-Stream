import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'discounts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('description').nullable()
      table.float('amount', 10, 2).notNullable()
      table.enum('type', ['fixed', 'percentage']).defaultTo('percentage').notNullable()
      table.dateTime('start_date').nullable()
      table.dateTime('end_date').nullable()
      table.float('minimum_purchase', 10, 2).nullable()
      table.integer('max_uses').nullable()
      table.boolean('is_combinable').defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
