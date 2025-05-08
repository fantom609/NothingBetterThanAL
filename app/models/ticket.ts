import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Session from "#models/session";
import User from "#models/user";
import Superticket from "#models/superticket";
import Transaction from "#models/transaction";
import { randomUUID } from 'node:crypto'


export default class Ticket extends BaseModel {

  @column({ isPrimary: true })
  declare userId: string

  @column({ isPrimary: true })
  declare sessionId: string

  @column()
  declare superticketId: string | null

  @column()
  declare transactionId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /** Relations */
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Session)
  declare session: BelongsTo<typeof Session>

  @belongsTo(() => Superticket)
  declare superticket: BelongsTo<typeof Superticket>

  @belongsTo(() => Transaction)
  declare transaction: BelongsTo<typeof Transaction>

}
