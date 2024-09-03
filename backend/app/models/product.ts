import { DateTime } from 'luxon'
import {afterFetch, afterFind, BaseModel, beforeSave, column} from '@adonisjs/lucid/orm'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare monthlyPrice : number

  @column()
  declare annualPrice : number

  @column()
  declare directDiscount : number

  @column()
  declare features: string | string[]

  @column()
  declare isActive : boolean

  @column()
  declare showOnHomepage: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  public static async serializeFeatures(product: Product) {
    if (Array.isArray(product.features)) {
      product.features = JSON.stringify(product.features)
    }
  }

  @afterFind()
  @afterFetch()
  public static async parseFeatures(products: Product | Product[]) {
    const parse = (product: Product) => {
      if (typeof product.features === 'string') {
        product.features = JSON.parse(product.features)
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
      features: this.features,
      isActive: this.isActive,
      showOnHomepage: this.showOnHomepage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
