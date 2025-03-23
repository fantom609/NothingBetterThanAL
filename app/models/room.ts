import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import Picture from '#models/picture'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Session from '#models/session'

export default class Room extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare type: string

  @column()
  declare disabled: boolean

  @column()
  declare maintenance: boolean

  @column()
  declare capacity: number

  @hasMany(() => Picture)
  declare posts: HasMany<typeof Picture>

  @hasMany(() => Session)
  declare sessions: HasMany<typeof Session>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(room: Room) {
    room.id = randomUUID()
  }
}
