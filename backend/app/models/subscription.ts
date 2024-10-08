import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  beforeUpdate,
  belongsTo,
  column,
  manyToMany,
  scope,
} from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'
import Order from '#models/order'
import Feature from '#models/feature'
import PaymentFactory from "#models/paymentGateway/PaymentGateway";

export default class Subscription extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare productId: number

  @column()
  declare orderId: number

  @column()
  declare status: 'inactive' | 'active' | 'expired' | 'canceled'

  @column()
  declare frequency: 'monthly' | 'yearly'

  @column.date()
  declare nextBillingDate: DateTime

  @column.dateTime()
  declare expiresAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Order)
  declare order: BelongsTo<typeof Order>

  @manyToMany(() => Feature, {
    pivotTable: 'subscription_features',
    pivotColumns: ['value'],
  })
  declare subscriptionFeatures: ManyToMany<typeof Feature>

  @manyToMany(() => Feature, {
    pivotTable: 'product_features',
    pivotColumns: ['value'],
  })
  declare productFeatures: ManyToMany<typeof Feature>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async checkDuplicateSubscription(subscription: Subscription) {
    if (subscription.$dirty.productId || subscription.$dirty.userId) {
      const existingSubscription = await Subscription.query()
        .where('userId', subscription.userId)
        .andWhere('productId', subscription.productId)
        .andWhere('status', 'active')
        .first()

      if (existingSubscription) {
        throw new Error('User already has an active subscription for this product.')
      }
    }
  }

  static applyFilters = scope((query, filters) => {
    Object.keys(filters).forEach((key) => {
      const value = filters[key]
      if (Array.isArray(value)) {
        query.whereIn(key, value)
      } else {
        query.where(key, value)
      }
    })
  })

  async getSubscriptionWithFeatures() {
    // Charger les features de la souscription avec leurs valeurs
    await this.load('subscriptionFeatures', (query) => {
      query.pivotColumns(['value'])
    })

    // Charger les features du produit avec leurs valeurs
    await this.load('product', (productQuery) => {
      productQuery.preload('features', (featureQuery) => {
        featureQuery.pivotColumns(['value'])
      })
    })

    // Maps pour stocker les features et leurs valeurs
    const subscriptionFeatureMap = new Map<string, Set<any>>()
    const productFeatureMap = new Map<string, Set<any>>()

    // Construire le map des features de la souscription
    for (const feature of this.subscriptionFeatures) {
      const featureName = feature.name
      const value = feature.$extras.pivot_value

      if (!subscriptionFeatureMap.has(featureName)) {
        subscriptionFeatureMap.set(featureName, new Set())
      }
      subscriptionFeatureMap.get(featureName).add(value)
    }

    // Construire le map des features du produit
    for (const feature of this.product.features) {
      const featureName = feature.name
      const value = feature.$extras.pivot_value

      if (!productFeatureMap.has(featureName)) {
        productFeatureMap.set(featureName, new Set())
      }
      productFeatureMap.get(featureName).add(value)
    }

    // Fusionner les features en priorisant celles de la souscription
    const mergedFeaturesMap = new Map<string, Set<any>>()

    // Commencer par les features de la souscription
    for (const [featureName, valueSet] of subscriptionFeatureMap.entries()) {
      mergedFeaturesMap.set(featureName, new Set(valueSet))
    }

    // Ajouter les features du produit qui manquent
    for (const [featureName, valueSet] of productFeatureMap.entries()) {
      if (!mergedFeaturesMap.has(featureName)) {
        // Si la feature n'est pas dans la souscription, on l'ajoute depuis le produit
        mergedFeaturesMap.set(featureName, new Set(valueSet))
      } else {
        // Si la feature existe déjà, on ajoute les valeurs manquantes du produit
        const mergedValueSet = mergedFeaturesMap.get(featureName)
        for (const value of valueSet) {
          if (!mergedValueSet.has(value)) {
            mergedValueSet.add(value)
          }
        }
      }
    }

    // Convertir le map en tableau de features avec leurs valeurs
    const mergedFeatures = []
    for (const [featureName, valueSet] of mergedFeaturesMap.entries()) {
      mergedFeatures.push({
        name: featureName,
        values: Array.from(valueSet),
      })
    }
    return mergedFeatures
  }

  async isExpired(): Promise<boolean> {
    return this.expiresAt < DateTime.now()
  }

  async renew(): Promise<void> {
    if (this.status === 'active' || this.status === 'expired') {
      this.expiresAt = this.expiresAt.plus({ months: this.frequency === 'monthly' ? 1 : 12 });
      this.status = 'active';
      await this.save();
    } else {
      throw new Error('Only active or expired subscriptions can be renewed.');
    }
  }

  async isExpiringSoon(days = 10): Promise<boolean> {
    return this.expiresAt < DateTime.now().plus({ days })
  }

  async cancel(): Promise<void> {
    if (this.status === 'active') {
      this.status = 'canceled';
      await this.save();
      await PaymentFactory.getProvider('stripe').cancelSubscription(this.id.toString());
    } else {
      throw new Error('Only active subscriptions can be canceled.');
    }
  }

  async revoke(): Promise<void> {
    if (this.status === 'active') {
      this.status = 'canceled'
      await this.save()
    } else {
      throw new Error('Only active subscriptions can be revoked.')
    }
  }

  async sendExpirationReminder(): Promise<void> {
    // Envoyer un e-mail de rappel à l'utilisateur
    console.log(`Sending expiration reminder to user ${this.userId} for subscription ${this.id}`)
  }

  async createRenewalOrder(): Promise<void> {
    let currentOrder;
    let newOrder;

    // Si l'ordre existe, on l'utilise
    if (this.orderId) {
      try {
        currentOrder = await Order.query().where('id', this.orderId).preload('items').firstOrFail();
      } catch (error) {
        console.log(`Order not found for subscription ${this.id}. Creating a new order...`);
      }
    }

    // Créer un nouvel order si aucun order n'existe
    if (!currentOrder) {
      const product = await Product.findOrFail(this.productId);

      newOrder = await Order.create({
        userId: this.userId,
        totalAmount: product.purchaseType === 'subscription'
          ? (this.frequency === 'monthly' ? product.monthlyPrice : product.annualPrice)
          : product.price,
        currency: 'USD',
        status: 'pending',
      });

      await newOrder.related('items').create({
        productId: product.id,
        quantity: 1,  // On suppose une quantité de 1 pour les abonnements
        unitPrice: newOrder.totalAmount,
        totalAmount: newOrder.totalAmount,
      });

      console.log(`New order created for subscription ${this.id}`);
    } else {
      // Copier les articles de l'ancienne commande dans la nouvelle si un order existait
      newOrder = await Order.create({
        userId: this.userId,
        totalAmount: currentOrder.totalAmount,
        currency: currentOrder.currency,
        status: 'pending',
      });

      for (const item of currentOrder.items) {
        await newOrder.related('items').create({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalAmount: item.totalAmount,
        });
      }

      console.log(`New order created from the existing order for subscription ${this.id}`);
    }

    // Mettre à jour la date d'expiration et la prochaine date de facturation
    this.expiresAt = this.frequency === 'monthly'
      ? DateTime.now().plus({ months: 1 })
      : DateTime.now().plus({ years: 1 });
    this.nextBillingDate = this.expiresAt;

    await this.save();
  }


  serialize() {
    return {
      id: this.id,
      user: this.user,
      product: this.product,
      orderId: this.orderId,
      status: this.status,
      expiresAt: DateTime.fromJSDate(new Date(this.expiresAt)).toFormat('dd/MM/yyyy'),
      createdAt: DateTime.fromJSDate(new Date(this.createdAt)).toFormat('dd/MM/yyyy'),
      features: this.getSubscriptionWithFeatures(),
      nextBillingDate: DateTime.fromJSDate(new Date(this.nextBillingDate)).toFormat('dd/MM/yyyy'),
      frequency: this.frequency,
    }
  }
}
