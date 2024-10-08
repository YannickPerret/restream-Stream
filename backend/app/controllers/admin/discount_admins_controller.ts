import type { HttpContext } from '@adonisjs/core/http'
import Discount from '#models/discount'
import Product from '#models/product'

export default class DiscountAdminsController {

  async index({ response }: HttpContext) {
    try {
      const discounts = await Discount.query().preload('products')

      return response.status(200).json(discounts)
    } catch (error) {
      return response.status(500).json({ message: 'Failed to fetch discounts', error })
    }
  }

  async store({ request, response }: HttpContext) {
    const discountData = request.only([
      'name',
      'description',
      'amount',
      'type',
      'start_date',
      'end_date',
      'minimum_purchase',
      'max_uses',
      'is_combinable'
    ])

    const productIds = request.input('products', [])

    try {
      const discount = await Discount.create(discountData)

      if (productIds.length > 0) {
        const products = await Product.query().whereIn('id', productIds)
        await discount.related('products').attach(products.map((product) => product.id))
      }

      return response.status(201).json(discount)
    } catch (error) {
      return response.status(400).json({ message: 'Failed to create discount', error })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const discount = await Discount.findOrFail(params.id)
      return response.status(200).json(discount)
    } catch (error) {
      return response.status(404).json({ message: 'Discount not found', error })
    }
  }

  async update({ params, request, response }: HttpContext) {
    const discountData = request.only([
      'name',
      'description',
      'amount',
      'type',
      'start_date',
      'end_date',
      'minimum_purchase',
      'max_uses',
      'is_combinable'
    ])

    // Récupération des produits (facultatif) pour lier ou délier
    const productIds = request.input('products', [])

    try {
      const discount = await Discount.findOrFail(params.id)
      discount.merge(discountData)
      await discount.save()

      // Gestion des relations avec les produits
      if (productIds.length > 0) {
        // On remplace les relations actuelles par les nouvelles
        const products = await Product.query().whereIn('id', productIds)
        await discount.related('products').sync(products.map((product) => product.id))
      }

      return response.status(200).json(discount)
    } catch (error) {
      return response.status(400).json({ message: 'Failed to update discount', error })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const discount = await Discount.findOrFail(params.id)
      await discount.delete()

      return response.status(200).json({ message: 'Discount deleted successfully' })
    } catch (error) {
      return response.status(404).json({ message: 'Discount not found', error })
    }
  }
}
