import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Room from '#models/room'

export default class extends BaseSeeder {
  async run() {
    await Room.createMany([
      {
        name: "Salle 1",
        description: "Salle pas mal",
        type: "2D",
        disabled: false,
        maintenance: false,
        capacity: 25
      },
      {
        name: "Salle 2",
        description: "En travaux",
        type: "3D",
        disabled: false,
        maintenance: true,
        capacity : 15
      },
      {
        name: "Salle 3",
        description: "Intouchable",
        type: "4D",
        disabled: true,
        maintenance: false,
        capacity: 29
      }])
  }
}
