import { DateTime } from 'luxon'
import {
  afterFetch,
  afterFind,
  BaseModel,
  beforeSave,
  belongsTo,
  column,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import Subscription from '#models/subscription'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Feature from '#models/feature'
import ProductGroup from '#models/product_group'
import Asset from "#models/asset";

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

  @column()
  declare logoPath: string | null

  @column()
  declare productGroupId: number

  @belongsTo(() => ProductGroup)
  declare productGroup: BelongsTo<typeof ProductGroup>

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
  static async serializeFeatures(product: Product) {
    if (Array.isArray(product.labelFeatures)) {
      product.labelFeatures = JSON.stringify(product.labelFeatures)
    }
  }

  @afterFind()
  @afterFetch()
  static async processProduct(products: Product | Product[]) {
    const processSingleProduct = async (product: Product) => {
      // Parse labelFeatures if necessary
      if (typeof product.labelFeatures === 'string') {
        product.labelFeatures = JSON.parse(product.labelFeatures)
      }

      // Transform logoPath into a signed URL
      if (product.logoPath) {
        product.logoPath = await Asset.signedUrl(product.logoPath)
      }
    }

    if (Array.isArray(products)) {
      // Process each product in the array (afterFetch hook)
      for (const product of products) {
        await processSingleProduct(product)
      }
    } else {
      // Process single product (afterFind hook)
      await processSingleProduct(products)
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
      logoPath: this.logoPath,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      features: this.features,
    }
  }
}
