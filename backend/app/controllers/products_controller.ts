import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import Feature from '#models/feature'

export default class ProductsController {
  async index({ response }: HttpContext) {
    const products = await Product.query()
      .where('is_active', '=', true)
      .andWhere('show_on_homepage', '=', true)
    return response.json(products)
  }

  async show({ response, params }: HttpContext) {
    // Charger le produit avec ses features
    const product = await Product.query()
      .where('id', params.id)
      .preload('features', (query) => {
        query.pivotColumns(['value'])
      })
      .firstOrFail()

    return response.json(product)
  }

  async update({ params, request, response }) {
    const { title, monthlyPrice, annualPrice, directDiscount, labelFeatures, features } =
      request.only([
        'title',
        'monthlyPrice',
        'annualPrice',
        'directDiscount',
        'labelFeatures',
        'features',
      ])

    const product = await Product.findOrFail(params.id)

    // Mettre à jour les détails du produit
    product.merge({
      title,
      monthlyPrice,
      annualPrice,
      directDiscount,
      labelFeatures,
    })
    await product.save()

    // Détacher toutes les anciennes features pour les remplacer avec les nouvelles valeurs
    await product.related('features').detach()

    // Traitement des features
    for (const featureData of features) {
      let feature = await Feature.findBy('name', featureData.name)

      if (!feature) {
        // Créer la feature si elle n'existe pas
        feature = await Feature.create({ name: featureData.name })
      }

      // Si la valeur est un tableau, on va insérer chaque valeur comme une nouvelle ligne
      const values = Array.isArray(featureData.value) ? featureData.value : [featureData.value]

      // Attacher chaque valeur individuellement comme une nouvelle ligne dans `product_features`
      for (const value of values) {
        await product.related('features').attach({
          [feature.id]: { value },
        })
      }
    }

    return response.json({ success: true, product })
  }

  async store({ request, response }) {
    const { title, monthlyPrice, annualPrice, directDiscount, labelFeatures, features } =
      request.only([
        'title',
        'monthlyPrice',
        'annualPrice',
        'directDiscount',
        'labelFeatures',
        'features',
      ])

    const existingProduct = await Product.findBy('title', title)
    if (existingProduct) {
      return response.badRequest({ message: 'Product with this title already exists' })
    }

    // Créer le produit
    const product = await Product.create({
      title,
      monthlyPrice,
      annualPrice,
      directDiscount,
      labelFeatures,
    })

    // Traitement des features
    for (const featureData of features) {
      let feature = await Feature.findBy('name', featureData.name)

      if (!feature) {
        // Créer la feature si elle n'existe pas
        feature = await Feature.create({ name: featureData.name })
      }

      // Si la valeur est un tableau, on va insérer chaque valeur comme une nouvelle ligne
      const values = Array.isArray(featureData.value) ? featureData.value : [featureData.value]

      // Attacher chaque valeur individuellement comme une nouvelle ligne dans `product_features`
      for (const value of values) {
        await product.related('features').attach({
          [feature.id]: { value },
        })
      }
    }

    return response.json({
      success: true,
      message: 'Product created successfully',
      product,
    })
  }

  async destroy({ params, response }: HttpContext) {}
}
