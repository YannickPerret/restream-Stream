import type { HttpContext } from '@adonisjs/core/http'
import Discount from '#models/discount'

export default class DiscountsController {
  async apply({ request, response }: HttpContext) {
    const { discountCode } = request.only(['discountCode'])

    const discount = await Discount.query().where('name', discountCode).preload('products').firstOrFail()

    if (!discount || !discount.isActive()) {
      return response.badRequest({ error: 'Invalid or inactive discount code' })
    }

    return response.json(discount)
  }
}
