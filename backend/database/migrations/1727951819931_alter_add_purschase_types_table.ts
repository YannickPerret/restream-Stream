import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('purchase_type', ['one-time', 'subscription']).defaultTo('subscription').notNullable()
      table.float('price').nullable()
      table.integer('monthly_price').nullable().alter()
      table.integer('annual_price').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('purchase_type')
      table.dropColumn('price')
      table.integer('monthly_price').notNullable().alter()
      table.integer('annual_price').notNullable().alter()
    })
  }
}
