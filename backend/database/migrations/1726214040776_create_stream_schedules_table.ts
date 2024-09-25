import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stream_schedules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('stream_id').unsigned().references('streams.id').notNullable()
      table.dateTime('start_time').notNullable()
      table.dateTime('end_time').notNullable()
      table.string('timezone').notNullable()
      table.enum('status', ['scheduled', 'running', 'completed', 'canceled']).defaultTo('scheduled')
      table
        .enum('recurrenceType', ['daily', 'weekly', 'monthly', 'yearly', 'null'])
        .defaultTo('null')
      table.dateTime('recurrenceEndDate').nullable()
      table.dateTime('nextRunDate').notNullable()
      table.integer('user_id').unsigned().notNullable().references('users.id')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
