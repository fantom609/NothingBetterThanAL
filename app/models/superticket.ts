import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Transaction from '#models/transaction'

export default class Superticket extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare remainingUses: number

  @column()
  declare userId: string

  @column()
  declare transactionId: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Transaction)
  declare transaction: BelongsTo<typeof Transaction>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(superticket: Superticket) {
    superticket.id = randomUUID()
  }
}
