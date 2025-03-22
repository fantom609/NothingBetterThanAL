import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('room_id')
        .unsigned()
        .references('id')
        .inTable('rooms')
        .onDelete('CASCADE')
        .notNullable()
      table
        .uuid('movie_id')
        .unsigned()
        .references('id')
        .inTable('movies')
        .onDelete('CASCADE')
        .notNullable()
      table.timestamp('start').notNullable()
      table.timestamp('end').notNullable()
      table.double('price').notNullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
