import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'streams'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('enable_browser').defaultTo(false).after('timeline_id')
      table.integer('browser_id').nullable().defaultTo(0)
      table.string('webpage_url').nullable().after('timeline_id')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('enabled_browser')
      table.dropColumn('browser_id')
      table.dropColumn('webpage_url')
    })
  }
}
