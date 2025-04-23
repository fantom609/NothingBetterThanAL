import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Room from '#models/room'

test.group('Movie delete', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('SUCCESS - 204', async ({ client }) => {
    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)


    const room = await Room.create({
      name: "Salle 1",
      description: "Salle pas mal",
      type: "2D",
      capacity: 20,
      disabled: false,
      maintenance: false,
    })

    const res = await client.delete('/api/rooms/' + room.id).bearerToken(token.value!.release())
    res.assertStatus(204)
  })

  test('FAIL - 403', async ({ client }) => {
    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)


    const room = await Room.create({
      name: "Salle 1",
      description: "Salle pas mal",
      type: "2D",
      capacity: 20,
      disabled: false,
      maintenance: false,
    })

    const res = await client.delete('/api/rooms/' + room.id).bearerToken(token.value!.release())
    res.assertForbidden()
  })

  test('FAIL - 404', async ({ client }) => {
    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

    const res = await client.delete('/api/rooms/1').bearerToken(token.value!.release())
    res.assertNotFound()
  })
})
