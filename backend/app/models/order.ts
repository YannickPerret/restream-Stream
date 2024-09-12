import { DateTime } from 'luxon'
import {BaseModel, belongsTo, column, hasMany, hasOne, scope} from '@adonisjs/lucid/orm'
import Payment from '#models/payment'
import User from '#models/user'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import OrderItem from '#models/order_item'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare totalAmount: number

  @column()
  declare currency: string

  @column()
  declare status: 'pending' | 'paid' | 'completed' | 'cancelled'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasOne(() => Payment)
  declare payment: HasOne<typeof Payment>

  static applyFilters = scope((query, filters) => {
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (Array.isArray(value)) {
        query.whereIn(key, value);
      } else {
        query.where(key, value);
      }
    });
  });

}
