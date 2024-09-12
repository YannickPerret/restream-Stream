import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'streams'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('resolution').defaultTo('1280x720').after('type').notNullable()
      table.string('bitrate').defaultTo('48000k').after('resolution').notNullable()
      table.integer('fps').defaultTo(30).after('bitrate').notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('resolution')
      table.dropColumn('bitrate')
      table.dropColumn('fps')
    })
  }
}
