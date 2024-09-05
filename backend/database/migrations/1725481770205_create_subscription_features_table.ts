import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscription_features'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('subscription_id').unsigned().references('subscriptions.id').onDelete('CASCADE')
      table.integer('feature_id').unsigned().references('features.id').onDelete('CASCADE')
      table.string('value').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
