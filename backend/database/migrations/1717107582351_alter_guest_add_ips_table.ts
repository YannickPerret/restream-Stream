import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'guests'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('ip_address').nullable().after('display_name')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('ip_address')
    })
  }
}
