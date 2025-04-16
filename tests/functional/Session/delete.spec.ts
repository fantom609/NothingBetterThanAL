import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Room from '#models/room'
import Movie from '#models/movie'
import Session from '#models/session'
import User from '#models/user'
import { DateTime } from 'luxon'

test.group('Session delete', async (group) => {
  const tomorrow = DateTime.now().plus({ days: 1 }).set({ hour: 16, minute: 30, second: 0, millisecond: 0 });

  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('SUCCESS - 204', async ({ client }) => {

    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)

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
      start: tomorrow,
      end: tomorrow.plus({ minutes: movie.duration + 30 }),
      price: 5.5,
    })

    const res = await client.delete('/api/sessions/' + session.id).bearerToken(token.value!.release())

    res.assertStatus(204)
  })

  test('FAIL - 401', async ({ client }) => {

    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

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

    const res = await client.delete('/api/sessions/' + session.id).bearerToken(token.value!.release())

    res.assertForbidden()
  })

  test('FAIL - 404', async ({ client }) => {

    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

    const res = await client.delete('/api/sessions/1').bearerToken(token.value!.release())

    res.assertNotFound()
  })
})
