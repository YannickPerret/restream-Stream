import { DateTime } from 'luxon'
import { BaseModel, column, computed, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import SubscriptionFeature from '#models/subscription_feature'
import Product from '#models/product'

export default class Feature extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @manyToMany(() => Product, {
    pivotTable: 'product_features',
    pivotColumns: ['value'],
  })
  declare products: ManyToMany<typeof Product>

  @hasMany(() => SubscriptionFeature)
  declare subscriptionFeatures: HasMany<typeof SubscriptionFeature>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  get pivotValue() {
    return this.$extras.pivot_value
  }
}
