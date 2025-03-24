import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tickets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
        .primary()
      table
        .uuid('session_id')
        .unsigned()
        .references('id')
        .inTable('sessions')
        .onDelete('CASCADE')
        .notNullable()
        .primary()
      table
        .uuid('superticket_id')
        .unsigned()
        .references('id')
        .inTable('supertickets')
        .onDelete('CASCADE')
        .nullable()
      table
        .uuid('transaction_id')
        .unsigned()
        .references('id')
        .inTable('transactions')
        .onDelete('CASCADE')
        .notNullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
