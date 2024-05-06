import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stream_providers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('stream_id').unsigned().references('streams.id').onDelete('CASCADE')
      table.integer('provider_id').unsigned().references('providers.id').onDelete('CASCADE')
      table.boolean('on_primary').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
