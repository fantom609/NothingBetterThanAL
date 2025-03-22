import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column, hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { randomUUID } from 'node:crypto'
import type { HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import Transaction from '#models/transaction'
import Superticket from '#models/superticket'
import Session from '#models/session'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare forname: string

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare role: string

  @hasMany(() => Transaction)
  declare transactions: HasMany<typeof Transaction>

  @manyToMany(() => Session)
  declare skills: ManyToMany<typeof Session>

  @hasOne(() => Superticket)
  declare superticket: HasOne<typeof Superticket>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @beforeCreate()
  static assignUuid(user: User) {
    user.id = randomUUID()
  }

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
