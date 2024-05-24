import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'queue_items'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('attempts').defaultTo(0).notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('attempts')
    })
  }
}
