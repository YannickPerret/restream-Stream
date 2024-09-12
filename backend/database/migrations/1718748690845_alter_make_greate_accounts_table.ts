import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('username').after('id').notNullable()
      table.string('ip_address').after('last_login_at').nullable()
      table
        .integer('role_id')
        .after('ip_address')
        .unsigned()
        .references('roles.id')
        .onDelete('CASCADE')
      table.dropColumn('full_name')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('username')
      table.dropColumn('ip_address')
      table.dropColumn('role_id')
      table.string('full_name').after('id')
    })
  }
}
