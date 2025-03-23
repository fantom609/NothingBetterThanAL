import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Room from '#models/room'

export default class Picture extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare path: string

  @column()
  declare roomId: string

  @belongsTo(() => Room)
  declare room: BelongsTo<typeof Room>

  @column()
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(picture: Picture) {
    picture.id = randomUUID()
  }
}
