import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'
import User from '#models/user'
import Product from '#models/product'
import { DateTime } from 'luxon'
import Feature from "#models/feature";

export default class SubscriptionsController {

  async index({request, response, auth}: HttpContext) {
    const user = await auth.authenticate();

    // Check if the request is coming from the admin route
    const requestUrl = request.url();
    const isAdminRoute = /^\/api\/admin\/subscriptions/.test(requestUrl);

    // Extract query parameters from the request for filtering
    const filters = request.qs()

    // Build the query
    const subscriptionQuery = Subscription.query().preload('product').preload('user');

    if (isAdminRoute) {
      // Admin route and user is admin: show all subscriptions with optional filters
      subscriptionQuery.withScopes((scopes) => scopes.applyFilters(filters));
    } else {
      // Non-admin route or non-admin user: only show subscriptions belonging to the authenticated user
      subscriptionQuery
        .where('userId', user.id)
        .withScopes((scopes) => scopes.applyFilters(filters));
    }

    // Execute the query and fetch the results
    const subscriptions = await subscriptionQuery.exec();

    return response.json(subscriptions);
  }

  async store({request, response, auth}: HttpContext) {
    // Authenticate the user
    const user = await auth.authenticate();

    // Extract data from the request
    const {userId, productId, status, expiresAt} = request.only([
      'userId',
      'productId',
      'status',
      'expiresAt',
    ]);

    // Validate that the user and product exist
    const targetUser = await User.find(userId);
    if (!targetUser) {
      return response.notFound({message: 'User not found'});
    }

    const product = await Product.find(productId);
    if (!product) {
      return response.notFound({message: 'Product not found'});
    }

    // Convert expiresAt to the correct format and set time to 23:59:59
    const formattedExpiresAt = DateTime.fromISO(expiresAt).set({hour: 23, minute: 59, second: 59});

    // Create the subscription
    const subscription = await Subscription.create({
      userId,
      productId,
      status,
      expiresAt: formattedExpiresAt,
    });

    return response.created({
      success: true,
      message: 'Subscription created successfully',
      subscription,
    });
  }

  async show({ response, auth, params }: HttpContext) {
    const user = await auth.authenticate();

    // Charger l'abonnement avec ses features et les product features
    const subscription = await Subscription.query()
      .preload('product', (productQuery) => {
        productQuery.preload('features'); // Charger les features du produit
      })
      .preload('subscriptionFeatures', (subFeatureQuery) => {
        subFeatureQuery.preload('subscriptionFeatures');
      })
      .preload('user')
      .where('id', params.id)
      .firstOrFail();

    return response.json(subscription);
  }

  async update({ params, request, response }: HttpContext) {
    const { id } = params;
    const { title, features } = request.only(['title', 'features']);

    // Récupérer le produit
    const product = await Product.findOrFail(id);

    // Si nécessaire, mettre à jour le titre du produit
    if (title) {
      product.title = title;
    }

    // Sauvegarder le produit
    await product.save();

    // Gestion des features
    for (const featureData of features) {
      let feature = await Feature.findBy('name', featureData.name);

      if (!feature) {
        // Créer la feature si elle n'existe pas
        feature = await Feature.create({ name: featureData.name });
      }

      // D'abord, dissocier toutes les anciennes valeurs pour cette feature pour éviter les duplications
      await product.related('features').detach([feature.id]);

      // Ajouter chaque valeur individuellement dans product_features
      for (const value of featureData.value) {
        await product.related('features').attach({
          [feature.id]: { value }
        });
      }
    }

    return response.json({ success: true, product });
  }
}
