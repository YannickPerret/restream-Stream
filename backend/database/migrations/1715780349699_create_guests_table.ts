import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'guests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('username').notNullable()
      table.string('email').nullable()
      table.string('display_name').nullable()
      table.string('discord_username').nullable()
      table.string('steam_username').nullable()
      table.string('twitch_username').nullable()
      table.string('twitter_username').nullable()
      table.string('youtube_username').nullable()
      table.string('telegram_username').nullable()
      table.boolean('can_diffuse').defaultTo(true)
      table.text('notes').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
