import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Room from '#models/room'

test.group('Room update', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('SUCCESS  - 200', async ({ client }) => {
    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)

    const room = await Room.create({
      name: "test",
      description: "test",
      type: "2D",
      disabled: true,
      capacity: 29,
      maintenance: false
    })

    const res = await client.patch('/api/rooms/' + room.id).json({
      name: 'joijoqjdioqsjdi',
    }).bearerToken(token.value!.release())

    res.assertOk()
  })

  test('Fail - 403', async ({ client }) => {
    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

    const room = await Room.create({
      name: "test",
      description: "test",
      type: "2D",
      disabled: true,
      capacity: 29,
      maintenance: false
    })

    const res = await client.patch('/api/rooms/' + room.id).json({
      name: 'joijoqjdioqsjdi',
    }).bearerToken(token.value!.release())

    res.assertForbidden()
  })

  test('Fail - 422', async ({ client }) => {
    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)

    const room = await Room.create({
      name: "test",
      description: "test",
      type: "2D",
      disabled: true,
      capacity: 29,
      maintenance: false
    })

    const res = await client.patch('/api/rooms/' + room.id).json({
      type: "5D"
    }).bearerToken(token.value!.release())

    res.assertUnprocessableEntity()
  })
})
