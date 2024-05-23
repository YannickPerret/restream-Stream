import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'streams'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('logo').nullable().after('timeline_id')
      table.string('guest_file').nullable().after('timeline_id')
      table.string('overlay').nullable().after('timeline_id')
      table.string('crypto_file').nullable().after('guest_file')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('logo')
      table.dropColumn('guest_file')
      table.dropColumn('overlay')
      table.dropColumn('crypto_file')
    })
  }
}
