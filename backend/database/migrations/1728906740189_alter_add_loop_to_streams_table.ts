import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'streams'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('loop').defaultTo(false).notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('loop')
    })
  }
}
