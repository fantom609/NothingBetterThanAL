import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Movie from '#models/movie'

export default class Picture extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare path: string

  @column()
  declare movieId: string

  @belongsTo(() => Movie)
  declare movie: BelongsTo<typeof Movie>

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
