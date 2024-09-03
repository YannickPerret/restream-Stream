import { DateTime } from 'luxon'
import {BaseModel, belongsTo, column} from '@adonisjs/lucid/orm'
import User from "#models/user";
import type {BelongsTo} from "@adonisjs/lucid/types/relations";
import Product from "#models/product";

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number
  @column()
  declare userId: number

  @column()
  declare productId: number

  @column()
  declare stripePaymentIntentId: string

  @column()
  declare amount: number

  @column()
  declare currency: string

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}
