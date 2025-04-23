import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Room from '#models/room'
import Movie from '#models/movie'
import Session from '#models/session'

test.group('Session ticket', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('SUCCESS - 200 - WITHOUT SUPERTICKET', async ({ client }) => {
    const room = await Room.create({
      name: 'Salle 4',
      description: "Salle 4D super stylée",
      type: "4D",
      disabled: false,
      maintenance: false,
      capacity: 19
    })
    const movie = await Movie.create({
      name: "Test",
      duration: 128,
    })

    const session = await Session.create({
      roomId: room.id,
      movieId: movie.id,
      start: "2025-05-23T18:30:00.000Z",
      end: "2025-05-23T20:30:00.000Z",
      price: 5.5,
    })

    await User.create({
      email: 'TestDoe@gmail.com',
      password: 'TestDoe20',
      balance: 1000,
      name: 'john',
      forname: 'Doe',
      role: 'USER',
    })

    const user = await User.verifyCredentials('TestDoe@gmail.com', 'TestDoe20')

    const token = await User.accessTokens.create(user)

    const res = await client.post('/api/sessions/' + session.id + '/buy').json({superTicket: false}).bearerToken(token.value!.release())


    res.assertCreated()
  })
})
