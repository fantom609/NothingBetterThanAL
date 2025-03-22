import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import Session from '#models/session'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Movie extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare duration: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => Session)
  declare sessions: HasMany<typeof Session>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(movie: Movie) {
    movie.id = randomUUID()
  }
}
