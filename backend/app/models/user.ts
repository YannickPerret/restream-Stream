import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Stream from '#models/stream'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Role from '#models/role'
import Subscription from '#models/subscription'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column()
  declare ipAddress: string

  @column()
  declare isVerified: boolean

  @column()
  declare roleId: number

  @hasMany(() => Subscription)
  declare subscriptions: HasMany<typeof Subscription>

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  @hasMany(() => Stream)
  declare streams: HasMany<typeof Stream>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '1 days',
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 45,
  })


  async isAdmin() {
    await this.load('role')
    return this.role && this.role.name === 'admin'
  }

  async getRole(): Promise<String> {
    await this.load('role')
    return this.role.name
  }

  async getActiveSubscriptions() {
    const now = DateTime.now().toSQL() // Conversion en chaîne de caractères SQL compatible
    return this.related('subscriptions').query()
      .where('status', 'active')
      .where('expires_at', '>', now)
  }

  async haveSubscriptionByProductId(productId: number): Promise<boolean> {
    const now = DateTime.now().toSQL() // Convertir en format SQL

    const activeSubscription = await this.related('subscriptions').query()
      .where('product_id', productId)
      .andWhere('status', 'active')
      .andWhere('expires_at', '>', now) // Utilisation correcte de la date/heure
      .first()

    return !!activeSubscription
  }

  async getActiveSubscriptionsWithFeatures() {
    const now = DateTime.now().toSQL();

    // Récupérer les souscriptions actives de l'utilisateur
    const activeSubscriptions = await this.related('subscriptions').query()
      .where('status', 'active')
      .andWhere('expires_at', '>', now)
      .preload('product', (productQuery) => {
        productQuery.preload('features'); // Charger les features du produit
      })
      .preload('subscriptionFeatures', (subscriptionFeatureQuery) => {
        subscriptionFeatureQuery.pivotColumns(['value']); // Charger les features spécifiques à la souscription
      });

    // Fusionner les features de chaque souscription avec la logique définie
    const subscriptionsWithMergedFeatures = await Promise.all(
      activeSubscriptions.map(async (subscription) => {
        const mergedFeatures = await subscription.getSubscriptionWithFeatures();
        return {
          ...subscription.serialize(),
          features: mergedFeatures,
        };
      })
    );

    return subscriptionsWithMergedFeatures;
  }


 /* async serialize() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      isVerified: this.isVerified,
      subscriptions: this.subscriptions,
      role: this.role,
    }
  }*/
}
