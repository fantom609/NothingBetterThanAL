import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Room from "#models/room";
import Movie from "#models/movie";
import Session from "#models/session";
import {DateTime} from "luxon";
import User from "#models/user";
import Transaction from "#models/transaction";

export default class extends BaseSeeder {
  async run() {
    const tomorrow = DateTime.now().plus({ days: 1 }).set({ hour: 16, minute: 30, second: 0, millisecond: 0 });

    const rooms = await Room.createMany([
      {
        name: 'Salle 3',
        description: 'Intouchable',
        type: '4D',
        capacity: 25,
        disabled: true,
        maintenance: false,
      },
      {
        name: 'Salle 6',
        description: 'Salle avec un big screen pour changer',
        type: '4D',
        capacity: 25,
        disabled: false,
        maintenance: false,
      },
    ])

    const movies = await Movie.createMany([
      {
        name: 'Barbie',
        duration: 114,
      },
      {
        name: 'Charlie et la chocolaterie',
        duration: 115,
      },
    ])

    const sessions = await Session.createMany([
      {
        roomId: rooms[0].id,
        movieId: movies[0].id,
        start: tomorrow,
        end: tomorrow.plus({ minutes: movies[0].duration + 30 }).plus({ days: 10 }),
        price: 5.5,
      },
      {
        roomId: rooms[1].id,
        movieId: movies[1].id,
        start: tomorrow,
        end: tomorrow.plus({ minutes: movies[0].duration + 30 }).plus({ days: 10 }),
        price: 8.5,
      },
    ])

    const users = await User.createMany([
      {
        email: 'jane.doe@gmail.com',
        password: 'JaneDoe123',
        balance: 800,
        name: 'Jane',
        forname: 'Doe',
        role: 'USER',
      },
      {
        email: 'alice.smith@gmail.com',
        password: 'Alice2024',
        balance: 1200,
        name: 'Alice',
        forname: 'Smith',
        role: 'USER',
      },
      {
        email: 'bob.martin@gmail.com',
        password: 'BobMartin99',
        balance: 500,
        name: 'Bob',
        forname: 'Martin',
        role: 'USER',
      },
      {
        email: 'charlie.brown@gmail.com',
        password: 'CharlieB123',
        balance: 1500,
        name: 'Charlie',
        forname: 'Brown',
        role: 'USER',
      },
      {
        email: 'moderator@cinema.com',
        password: 'ModCinema2024',
        balance: 200,
        name: 'Mod',
        forname: 'Erator',
        role: 'ADMIN',
      },
    ])

    const transactions = await Transaction.createMany([
      {
        userId: users[0].id,
        type: 'TICKET',
        balance: users[0].balance - sessions[0].price,
        amount: -sessions[0].price,
      },
      {
        userId: users[1].id,
        type: 'TICKET',
        balance: users[1].balance - sessions[0].price,
        amount: -sessions[0].price,
      },
      {
        userId: users[2].id,
        type: 'TICKET',
        balance: users[2].balance - sessions[1].price,
        amount: -sessions[1].price,
      },
      {
        userId: users[3].id,
        type: 'TICKET',
        balance: users[3].balance - sessions[1].price,
        amount: -sessions[1].price,
      },
      {
        userId: users[4].id,
        type: 'TICKET',
        balance: users[4].balance - sessions[0].price,
        amount: -sessions[0].price,
      },
  ])

    await users[0].related('tickets').attach({
      [sessions[0].id]: {
        transaction_id: transactions[0].id,
        superticket_id: null,
      },
    })

    await users[1].related('tickets').attach({
      [sessions[0].id]: {
        transaction_id: transactions[1].id,
        superticket_id: null,
      },
    })

    await users[2].related('tickets').attach({
      [sessions[1].id]: {
        transaction_id: transactions[2].id,
        superticket_id: null,
      },
    })

    await users[3].related('tickets').attach({
      [sessions[1].id]: {
        transaction_id: transactions[3].id,
        superticket_id: null,
      },
    })

    await users[4].related('tickets').attach({
      [sessions[0].id]: {
        transaction_id: transactions[4].id,
        superticket_id: null,
      },
    })
  }
}
