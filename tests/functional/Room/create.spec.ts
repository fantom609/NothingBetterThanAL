import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import vine from '@vinejs/vine'

test.group('Room create', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('SUCCESS - 201', async ({ client }) => {
    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)

    const res = await client.post('/api/rooms').json({
      name: "test",
      description: "test",
      type: "2D",
      disabled: true,
      capacity: 25,
    }).bearerToken(token.value!.release())

    res.assertCreated()
  })

  test('FAIL - 403', async ({ client }) => {
    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

    const res = await client.post('/api/rooms').json({
      name: "test",
      description: "test",
      type: "2D",
      disabled: true,
      capacity: 25,
    }).bearerToken(token.value!.release())

    res.assertForbidden()
  })

  test('FAIL - 422', async ({ client }) => {
    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)

    const res = await client.post('/api/rooms').json({
      name: "test",
      description: "test",
      type: "2D",
      disabled: true,
      capacity: 2903203,
    }).bearerToken(token.value!.release())

    res.assertUnprocessableEntity()
  })
})
