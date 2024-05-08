import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'providers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table
        .enum('type', ['twitch', 'youtube', 'tiktok', 'twitter', 'reddit', 'facebook', 'custom'])
        .notNullable()
        .defaultTo('custom')
      table.string('client_id').nullable()
      table.string('client_secret').nullable()
      table.string('access_token').nullable()
      table.string('refresh_token').nullable()
      table.string('broadcaster_id').nullable()
      table.string('auth_bearer').nullable()
      table.string('stream_key').nullable()
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
