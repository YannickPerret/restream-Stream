import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'videos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('status', ['published', 'unpublished', 'pending', 'encoding'])
        .defaultTo('published')
        .after('show_in_live')

      table.dropColumn('is_published')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status')
      table.boolean('is_published').defaultTo(true).after('show_in_live')
    })
  }
}
