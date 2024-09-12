import { DateTime } from 'luxon'
import {
  afterFetch,
  afterFind,
  BaseModel,
  beforeSave,
  column,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import Subscription from '#models/subscription'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Feature from '#models/feature'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare monthlyPrice: number

  @column()
  declare annualPrice: number

  @column()
  declare directDiscount: number

  @column()
  declare labelFeatures: string | string[]

  @column()
  declare isActive: boolean

  @column()
  declare showOnHomepage: boolean

  @manyToMany(() => Feature, {
    pivotTable: 'product_features',
    pivotColumns: ['value'],
  })
  declare features: ManyToMany<typeof Feature>

  @hasMany(() => Subscription)
  declare subscriptions: HasMany<typeof Subscription>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  public static async serializeFeatures(product: Product) {
    if (Array.isArray(product.labelFeatures)) {
      product.labelFeatures = JSON.stringify(product.labelFeatures)
    }
  }

  @afterFind()
  @afterFetch()
  public static async parseFeatures(products: Product | Product[]) {
    const parse = (product: Product) => {
      if (typeof product.labelFeatures === 'string') {
        product.labelFeatures = JSON.parse(product.labelFeatures)
      }
    }

    if (Array.isArray(products)) {
      products.forEach(parse)
    } else {
      parse(products)
    }
  }

  serialize() {
    return {
      id: this.id,
      title: this.title,
      monthlyPrice: this.monthlyPrice,
      annualPrice: this.annualPrice,
      directDiscount: this.directDiscount,
      labelFeatures: this.labelFeatures,
      isActive: this.isActive,
      showOnHomepage: this.showOnHomepage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      features: this.features,
    }
  }
}
