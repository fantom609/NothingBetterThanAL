import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  column,manyToMany,
} from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Room from '#models/room'
import Movie from '#models/movie'
import User from '#models/user'

export default class Session extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare roomId: string

  @belongsTo(() => Room)
  declare room: BelongsTo<typeof Room>

  @column()
  declare movieId: string

  @belongsTo(() => Movie)
  declare movie: BelongsTo<typeof Movie>

  @column.dateTime()
  declare start: DateTime

  @column.dateTime()
  declare end: DateTime

  @column()
  declare price: number

  @manyToMany(() => User)
  declare users: ManyToMany<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(session: Session) {
    session.id = randomUUID()
  }
}
