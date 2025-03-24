import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('type')
    })
  }

  async down() {
  }
}
