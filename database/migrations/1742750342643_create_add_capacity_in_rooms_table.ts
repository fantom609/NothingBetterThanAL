import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rooms'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('capacity').notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('capacity')
    })
  }
}
