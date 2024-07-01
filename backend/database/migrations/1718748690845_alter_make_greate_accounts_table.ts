import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('username').after('id').notNullable()
      table.string('first_name').after('username').notNullable()
      table.string('last_name').after('first_name').notNullable()
      table.string('phone').after('last_name').nullable()
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
      table.dropColumn('first_name')
      table.dropColumn('last_name')
      table.dropColumn('phone')
      table.dropColumn('ip_address')
      table.dropColumn('role_id')
      table.string('full_name').after('id')
    })
  }
}
