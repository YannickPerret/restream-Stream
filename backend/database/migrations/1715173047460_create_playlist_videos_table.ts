import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'playlist_videos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('playlist_id').unsigned().references('playlists.id').onDelete('CASCADE')
      table.integer('video_id').unsigned().references('videos.id').onDelete('CASCADE')
      table.integer('order').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
