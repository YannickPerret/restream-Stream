import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'providers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('access_token')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('access_token', 64).nullable().defaultTo('')
    })
  }
}
