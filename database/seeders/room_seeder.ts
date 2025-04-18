import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Room from '#models/room'

export default class extends BaseSeeder {
  async run() {
    await Room.createMany([
      {
        name: "Salle 1",
        description: "Salle pas mal",
        type: "2D",
        capacity: 20,
        disabled: false,
        maintenance: false,
      },
      {
        name: "Salle 2",
        description: "En travaux",
        type: "3D",
        capacity: 30,
        disabled: false,
        maintenance: true,
      },
    ])
  }
}
