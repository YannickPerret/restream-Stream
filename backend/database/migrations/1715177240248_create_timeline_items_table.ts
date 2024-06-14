import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'timeline_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('type', ['playlist', 'video']).notNullable()
      table.integer('timeline_id').unsigned().references('timelines.id').onDelete('CASCADE')
      table.integer('item_id').unsigned().notNullable()
      table.integer('order').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
