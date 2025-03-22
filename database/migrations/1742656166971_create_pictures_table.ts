import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pictures'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('path').notNullable()
      table
        .uuid('room_id')
        .unsigned()
        .references('id')
        .inTable('rooms')
        .onDelete('CASCADE')
        .notNullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
