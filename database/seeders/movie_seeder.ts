import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Movie from '#models/movie'

export default class extends BaseSeeder {
  async run() {
    await Movie.createMany([{
      name: "La Reine des Neiges",
      duration: 102
      },
      {
        name: 'Oppenheimer',
        duration: 180,
      }
      ])
  }
}
