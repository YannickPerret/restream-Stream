import { BaseSchema } from '@adonisjs/lucid/schema'
import env from '#start/env'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('users.id')
      table.float('total_amount').notNullable()
      table.string('currency').notNullable().defaultTo('usd')
      table.enum('status', ['pending', 'paid', 'completed', 'cancelled'])
      table.string('slug').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.defer(async (db) => {
      if (env.get('ORDER_START')) {
        db.raw(`ALTER TABLE ${this.tableName} AUTO_INCREMENT = ${env.get('ORDER_START')}`)
      }
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
