import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import Feature from '#models/feature'

export default class ProductsController {
  async index({ response }: HttpContext) {
    const products = await Product.query().where('is_active', '=', true).andWhere('show_on_homepage', '=', true)
    return response.json(products);
  }

  async show({ response, params }: HttpContext) {
    // Load the product with its features
    const product = await Product.query()
      .where('id', params.id)
      .preload('features', (query) => {
        query.pivotColumns(['value'])
      })
      .firstOrFail()

    return response.json(product)
  }

  async update({ params, request, response, auth }: HttpContext) {
    const user = await auth.authenticate()
    const { title, monthlyPrice, annualPrice, directDiscount, labelFeatures, features } =
      request.only([
        'title',
        'monthlyPrice',
        'annualPrice',
        'directDiscount',
        'labelFeatures',
        'features',
      ])

    const { id } = params
    // Find the product
    const product = await Product.findOrFail(id)

    // Update product details
    product.merge({
      title,
      monthlyPrice,
      annualPrice,
      directDiscount,
      labelFeatures,
    })

    await product.save()

    // Process features
    for (const featureData of features) {
      let feature = await Feature.findBy('name', featureData.name)

      if (!feature) {
        // Create the feature if it doesn't exist
        feature = await Feature.create({ name: featureData.name })
      }

      // Attach or update the pivot table entry with the new value
      await product.related('features').sync({
        [feature.id]: {
          value: featureData.value,
        },
      }, false)
    }

    return response.json({ success: true, product })
  }

  async destroy({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    if (!product) return response.badRequest()

  }

  async store({ request, response }: HttpContext) {
    const { title, monthlyPrice, annualPrice, directDiscount, labelFeatures, features } =
      request.only([
        'title',
        'monthlyPrice',
        'annualPrice',
        'directDiscount',
        'labelFeatures',
        'features',
      ])

    // Check if a product with the same title already exists (you might want to change this check)
    const existingProduct = await Product.findBy('title', title)
    if (existingProduct) {
      return response.badRequest({ message: 'Product with this title already exists' })
    }

    // Create the new product
    const product = await Product.create({
      title,
      monthlyPrice,
      annualPrice,
      directDiscount,
      labelFeatures,
    })

    // Process features
    for (const featureData of features) {
      let feature = await Feature.findBy('name', featureData.name)

      if (!feature) {
        // Create the feature if it doesn't exist
        feature = await Feature.create({ name: featureData.name })
      }

      // Attach the feature to the product with the value
      await product.related('features').attach({
        [feature.id]: {
          value: featureData.value,
        },
      })
    }

    return response.json({
      success: true,
      message: 'Product created successfully',
      product,
    })
  }
}
