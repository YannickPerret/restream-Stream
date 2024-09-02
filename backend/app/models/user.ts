import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Stream from '#models/stream'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Role from '#models/role'
import env from "#start/env";
import mail from "@adonisjs/mail/services/main";

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
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare phone: string

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

  async sendResetPasswordEmail(ipAddress: string) {
    const tokenType = await TokenType.findBy('name', 'reset_password')
    const token = await Token.generate(
      DateTime.now().plus({ hours: 1 }),
      tokenType,
      this,
      ipAddress
    )

    await mail.send((message) => {
      message
        .from('noreply@one-conseils.ch')
        .to(this.email)
        .subject('One-conseils - Réinitialisation de votre mot de passe')
        .htmlView('emails/users/reset_password', {
          user: this,
          token: token,
          frontendUrl: env.get('FRONTEND_URL'),
        })
    })
  }

  async updatePassword(newPassword: string) {
    this.password = newPassword
    await this.save()
  }
}
