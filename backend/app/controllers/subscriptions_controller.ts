import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '#models/subscription'
import User from '#models/user'
import Product from '#models/product'
import { DateTime } from 'luxon'
import Feature from '#models/feature'
import Payment from "#models/payment";
import OrderItem from "#models/order_item";
import Order from "#models/order";

export default class SubscriptionsController {
  async index({ response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const subscriptions = await Subscription.query()
      .preload('product')
      .preload('user')
      .where('userId', user.id)

    return response.json(subscriptions)
  }

  async store({ request, response, auth }: HttpContext) {
    // Extract data from the request
    const { userId, productId, status, expiresAt } = request.only([
      'userId',
      'productId',
      'status',
      'expiresAt',
    ])

    // Validate that the user and product exist
    const targetUser = await User.find(userId)
    if (!targetUser) {
      return response.notFound({ message: 'User not found' })
    }

    const product = await Product.find(productId)
    if (!product) {
      return response.notFound({ message: 'Product not found' })
    }

    // Convert expiresAt to the correct format and set time to 23:59:59
    const formattedExpiresAt = DateTime.fromISO(expiresAt).set({ hour: 23, minute: 59, second: 59 })

    // Create the subscription
    const subscription = await Subscription.create({
      userId,
      productId,
      status,
      expiresAt: formattedExpiresAt,
      nextBillingDate: formattedExpiresAt,
    })

    return response.created({
      success: true,
      message: 'Subscription created successfully',
      subscription,
    })
  }

  async show({ response, auth, params }: HttpContext) {
    // Charger l'abonnement avec ses features et les product features
    const subscription = await Subscription.query()
      .preload('product', (productQuery) => {
        productQuery.preload('features') // Charger les features du produit
      })
      .preload('subscriptionFeatures', (subFeatureQuery) => {
        subFeatureQuery.preload('subscriptionFeatures')
      })
      .preload('user')
      .where('id', params.id)
      .firstOrFail()

    console.log(subscription)

    return response.json(subscription)
  }

  async update({ params, request, response }: HttpContext) {
    const { id } = params;
    const { title, features } = request.only(['title', 'features']);

    console.log(features);
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

      // Assurer que featureData.value est bien un tableau
      const values = Array.isArray(featureData.value) ? featureData.value : [featureData.value];

      // Ajouter chaque valeur individuellement dans product_features
      for (const value of values) {
        await product.related('features').attach({
          [feature.id]: { value },
        });
      }
    }

    return response.json({ success: true, product });
  }


  async upgrade({ request, response, auth }: HttpContext) {
    const user = await auth.authenticate();
    if (!user) return response.badRequest();

    const { subscriptionId, productId, isMonthly, paymentMethodId, returnUrl } = request.only([
      'subscriptionId',
      'productId',
      'isMonthly',
      'paymentMethodId',
      'returnUrl',
    ]);

    try {
      // Récupérer l'abonnement actuel et le produit associé
      const currentSubscription = await Subscription.findOrFail(subscriptionId);
      const product = await Product.findOrFail(productId);

      // Désactiver l'abonnement existant
      currentSubscription.status = 'cancelled';
      await currentSubscription.save();

      // Calculer le prix du nouveau produit
      const newPrice = isMonthly ? product.monthlyPrice : product.annualPrice;

      // Créer une nouvelle commande (Order)
      const order = await Order.create({
        userId: user.id,
        totalAmount: newPrice,
        status: 'pending',
        currency: 'usd',
      });

      // Ajouter le nouveau produit à la commande
      await OrderItem.create({
        productId: product.id,
        orderId: order.id,
        quantity: 1,
        unitPrice: newPrice,
        totalAmount: newPrice,
      });

      // Créer un nouveau Payment Intent avec Stripe (si le montant est > 0)
      let paymentIntent;
      if (newPrice > 0) {
        paymentIntent = await Payment.createPaymentIntent(order, user, {
          paymentMethodId,
          returnUrl,
        });

        // Sauvegarder le paiement
        await Payment.create({
          orderId: order.id,
          stripePaymentIntentId: paymentIntent.id,
          amount: newPrice,
          currency: 'usd',
          status: paymentIntent.status,
        });

        if (paymentIntent.status === 'succeeded') {
          order.status = 'completed';
          await order.save();
        }
      } else {
        // Si le montant est de 0, marquer directement la commande comme complète
        order.status = 'completed';
        await order.save();
      }

      // Créer une nouvelle souscription pour le produit choisi
      const expiresAt = isMonthly
        ? DateTime.now().plus({ months: 1 })
        : DateTime.now().plus({ years: 1 });

      await Subscription.create({
        userId: user.id,
        productId: product.id,
        orderId: order.id,
        status: 'active',
        expiresAt: expiresAt,
      });

      return response.json({ success: true, order });

    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: 'Error upgrading subscription' });
    }
  }

  async renew({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
  }

  async revoke({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
  }
}
