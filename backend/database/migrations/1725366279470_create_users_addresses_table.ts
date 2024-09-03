import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_addresses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').defaultTo('Address 1').notNullable()
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('phone').notNullable()
      table.string('address', 255).notNullable()
      table.string('city', 100).notNullable()
      table.string('state', 100).notNullable()
      table.string('zip', 20).notNullable()
      table.string('country', 100).notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
