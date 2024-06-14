import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'streams'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.integer('pid').nullable()
      table.enum('status', ['active', 'inactive']).defaultTo('inactive')
      table.dateTime('start_time').nullable()
      table.dateTime('end_time').nullable()
      table.integer('timeline_id').unsigned().references('timelines.id').onDelete('CASCADE')
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
