import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Room from '#models/room'
import Movie from '#models/movie'
import Session from '#models/session'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {

    const tomorrow = DateTime.now().plus({ days: 1 }).set({ hour: 16, minute: 30, second: 0, millisecond: 0 });

    const room = await Room.create({
      name: 'Salle 4',
      description: "Salle 4D super stylée",
      type: "4D",
      disabled: false,
      maintenance: false,
    })
    const movie = await Movie.create({
      name: "Lalaland",
      duration: 128,
      })

    await Session.create({
      roomId: room.id,
      movieId: movie.id,
      start: tomorrow,
      end: tomorrow.plus({ minutes: movie.duration + 30 }),
      price: 5.5,
    })
  }
}
