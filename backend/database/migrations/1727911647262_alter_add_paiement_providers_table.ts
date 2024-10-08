import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('payment_provider').notNullable()
      table.string('payment_provider_id').notNullable()
      table.integer('user_id').unsigned().references('users.id').nullable()
      table.dropColumn('stripe_payment_intent_id')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('payment_provider')
      table.dropColumn('payment_provider_id')
      table.string('stripe_payment_intent_id').notNullable()
      table.dropForeign(['user_id'])
      table.dropColumn('user_id')
    })
  }
}
