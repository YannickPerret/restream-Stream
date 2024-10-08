import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import Feature from '#models/feature'
import Asset from '#models/asset'

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

  async update({ params, request, response }: HttpContext) {
    const { title, monthlyPrice, annualPrice, directDiscount, labelFeatures, features, logoPath } =
      request.only([
        'title',
        'monthlyPrice',
        'annualPrice',
        'directDiscount',
        'labelFeatures',
        'features',
        'logoPath',
      ])

    const product = await Product.findOrFail(params.id)

    // Mettre à jour les détails du produit
    product.merge({
      title,
      monthlyPrice,
      annualPrice,
      directDiscount,
      labelFeatures,
      logoPath: logoPath && logoPath,
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

  async store({ request, response }: HttpContext) {
    const {
      title,
      monthlyPrice,
      annualPrice,
      directDiscount,
      labelFeatures,
      features,
      productGroup,
    } = request.only([
      'title',
      'monthlyPrice',
      'annualPrice',
      'directDiscount',
      'labelFeatures',
      'features',
      'productGroup',
    ])

    const existingProduct = await Product.findBy('title', title)
    if (existingProduct) {
      return response.badRequest({ message: 'Product with this title already exists' })
    }

    // Récupération du fichier 'logoPath'
    const image = request.file('logoPath', {
      size: '2mb',
      extnames: ['jpeg', 'jpg', 'png', 'svg', 'webp'],
    });

    let key = null;
    if (image) {
      try {
        if (!image.isValid) {
          return response.badRequest({ message: 'Invalid image format or size' });
        }

        key = await Asset.uploadToS3(image, 'products');
      } catch (error) {
        console.error('Failed to upload image to S3', error);
      }
    }

    const product = await Product.create({
      title,
      monthlyPrice,
      annualPrice,
      directDiscount,
      labelFeatures: labelFeatures && JSON.parse(labelFeatures),
      logoPath: key,
      productGroupId: productGroup,
    })

    // Gérer les features
    if (features) {
      for (const featureData of JSON.parse(features)) {
        console.log(featureData)
        let feature = await Feature.findBy('name', featureData.name)

        if (!feature) {
          feature = await Feature.create({ name: featureData.name })
        }

        await product.related('features').attach({
          [feature.id]: {
            value: featureData.value,
          },
        })
      }
    }

    return response.json({
      success: true,
      message: 'Product created successfully',
    })
  }

  async destroy({ params, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    await user.load('role')
    if (user.role.name !== 'admin') {
      return response.unauthorized({ message: 'You are not authorized to perform this action' })
    }
    const product = await Product.findOrFail(params.id)

    if (product.logoPath) {
      await Asset.deleteFromS3(product.logoPath)
    }

    await product.related('features').detach()

    await product.delete()
    return response.json({ success: true })
  }
}
