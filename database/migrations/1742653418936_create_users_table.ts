import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('password').notNullable()
      table.string('forname').notNullable()
      table.integer('balance').notNullable()
      table.string('name').notNullable()
      table.string('email').notNullable().unique()
      table.enum('role', ['ADMIN', 'USER', 'SUPERADMIN']).notNullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
