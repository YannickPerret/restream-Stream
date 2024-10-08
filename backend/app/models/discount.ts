import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Order from '#models/order'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'

export default class Discount extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description?: string

  @column()
  declare amount: number

  @column()
  declare type: 'fixed' | 'percentage'

  @column()
  declare scope: 'product' | 'order'

  @column.dateTime()
  declare startDate?: DateTime

  @column.dateTime()
  declare endDate?: DateTime

  @column()
  declare minimumPurchase?: number

  @column()
  declare maxUses?: number

  @column()
  declare isCombinable: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Product, {
    pivotTable: 'product_discounts',
  })
  declare products: ManyToMany<typeof Product>

  static async applyDiscount(orderId: number, discountCode: string) {
    const order = await Order.find(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    const discount = await this.findBy('code', discountCode)
    if (!discount || !discount.isActive()) {
      throw new Error('Invalid or inactive discount')
    }

    let totalDiscount = 0

    if (discount.type === 'percentage') {
      totalDiscount = (order.totalAmount * discount.amount) / 100
    } else if (discount.type === 'fixed') {
      totalDiscount = discount.amount
    }

    // Appliquer le discount à la commande
    order.totalAmount = order.totalAmount - totalDiscount
    await order.save()

    return {
      message: 'Discount applied successfully',
      newTotal: order.totalAmount,
    }
  }

  isActive(): boolean {
    const now = DateTime.now()
    if (this.startDate && this.endDate) {
      return now >= this.startDate && now <= this.endDate
    }
    return true
  }

  isValid(): boolean {
    const now = DateTime.now()

    // Si `start_date` est définie, le coupon n'est pas valide avant cette date
    if (this.startDate && now < this.startDate) {
      return false
    }

    // Si `end_date` est définie, le coupon n'est plus valide après cette date
    if (this.endDate && now > this.endDate) {
      return false
    }

    // Si aucune des deux dates n'empêche la validité, le coupon est valide
    return true
  }

  applyDiscount(amount: number): number {
    if (this.type === 'fixed') {
      return Math.max(0, amount - this.amount)  // Pour éviter des montants négatifs
    } else if (this.type === 'percentage') {
      return Math.max(0, amount * (1 - this.amount / 100))
    }
    return amount
  }
}
