import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'guests'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('username')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('username').notNullable().unique()
    })
  }
}
