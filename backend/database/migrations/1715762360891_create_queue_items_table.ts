import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'queue_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('queue_id').unsigned().references('queues.id').onDelete('CASCADE')
      table.integer('video_id').unsigned().references('videos.id').onDelete('CASCADE')
      table.string('start_time_code').nullable()
      table.string('end_time_code').nullable()
      table.enum('status', ['pending', 'processing', 'completed', 'failed']).defaultTo('pending')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
