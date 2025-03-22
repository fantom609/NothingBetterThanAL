import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        email: 'admin@cinema.com',
        password: 'Cinema1234',
        name: 'admin',
        forname: 'admin',
        role: 'ADMIN',
      },
      {
        email: 'JohnDoe@gmail.com',
        password: 'JohnDoe20',
        name: 'john',
        forname: 'Doe',
        role: 'USER',
      },
    ])
  }
}
