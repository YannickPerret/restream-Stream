import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_tokens'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('status', ['inactive', 'active', 'expired', 'used']).defaultTo('active').notNullable()
      table.string('ip', 45).notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status')
      table.dropColumn('ip')
    })
  }
}
