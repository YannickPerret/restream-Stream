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
  declare subscriptionFeatures: ManyToMany<typeof Feature>;

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
  @beforeUpdate()
  public static async checkDuplicateSubscription(subscription: Subscription) {
    if (subscription.$dirty.productId || subscription.$dirty.userId) {
      const existingSubscription = await Subscription.query()
        .where('userId', subscription.userId)
        .andWhere('productId', subscription.productId)
        .andWhere('status', 'active')
        .first()

      if (existingSubscription) {
        throw new Error('User already has an active subscription for this product.');
      }
    }
  }

  static applyFilters = scope((query, filters) => {
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (Array.isArray(value)) {
        query.whereIn(key, value);
      } else {
        query.where(key, value);
      }
    });
  });

  async getSubscriptionWithFeatures() {
    // Charger les features de la souscription avec leurs valeurs
    await this.load('subscriptionFeatures', (query) => {
      query.pivotColumns(['value']);
    });

    // Charger les features du produit avec leurs valeurs
    await this.load('product', (productQuery) => {
      productQuery.preload('features', (featureQuery) => {
        featureQuery.pivotColumns(['value']);
      });
    });

    // Maps pour stocker les features et leurs valeurs
    const subscriptionFeatureMap = new Map<string, Set<any>>();
    const productFeatureMap = new Map<string, Set<any>>();

    // Construire le map des features de la souscription
    for (const feature of this.subscriptionFeatures) {
      const featureName = feature.name;
      const value = feature.$extras.pivot_value;

      if (!subscriptionFeatureMap.has(featureName)) {
        subscriptionFeatureMap.set(featureName, new Set());
      }
      subscriptionFeatureMap.get(featureName).add(value);
    }

    // Construire le map des features du produit
    for (const feature of this.product.features) {
      const featureName = feature.name;
      const value = feature.$extras.pivot_value;

      if (!productFeatureMap.has(featureName)) {
        productFeatureMap.set(featureName, new Set());
      }
      productFeatureMap.get(featureName).add(value);
    }

    // Fusionner les features en priorisant celles de la souscription
    const mergedFeaturesMap = new Map<string, Set<any>>();

    // Commencer par les features de la souscription
    for (const [featureName, valueSet] of subscriptionFeatureMap.entries()) {
      mergedFeaturesMap.set(featureName, new Set(valueSet));
    }

    // Ajouter les features du produit qui manquent
    for (const [featureName, valueSet] of productFeatureMap.entries()) {
      if (!mergedFeaturesMap.has(featureName)) {
        // Si la feature n'est pas dans la souscription, on l'ajoute depuis le produit
        mergedFeaturesMap.set(featureName, new Set(valueSet));
      } else {
        // Si la feature existe déjà, on ajoute les valeurs manquantes du produit
        const mergedValueSet = mergedFeaturesMap.get(featureName);
        for (const value of valueSet) {
          if (!mergedValueSet.has(value)) {
            mergedValueSet.add(value);
          }
        }
      }
    }

    // Convertir le map en tableau de features avec leurs valeurs
    const mergedFeatures = [];
    for (const [featureName, valueSet] of mergedFeaturesMap.entries()) {
      mergedFeatures.push({
        name: featureName,
        values: Array.from(valueSet),
      });
    }

    //console.log(mergedFeatures);

    return mergedFeatures;
  }

  serialize(){
    return {
      id: this.id,
      user: this.user,
      product: this.product,
      orderId: this.orderId,
      status: this.status,
      expiresAt: new Date(this.expiresAt).toLocaleDateString(),
      createdAt: new Date(this.createdAt).toLocaleDateString(),
      features: this.getSubscriptionWithFeatures(),
    }
  }
}
