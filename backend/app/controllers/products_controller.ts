import type { HttpContext } from '@adonisjs/core/http'
import Product from "#models/product";

export default class ProductsController {
  async index({ response }: HttpContext) {
    const products = await Product.query().where('is_active', '=', true).andWhere('show_on_homepage', '=', true)
    return response.json(products);
  }

  async show({ response, params }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    return response.json(product)
  }
}
