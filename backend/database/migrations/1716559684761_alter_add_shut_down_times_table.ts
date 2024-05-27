import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'streams'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('restart_times').defaultTo(115200000).after('status')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('restart_times')
    })
  }
}
