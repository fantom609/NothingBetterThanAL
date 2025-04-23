import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'


test.group('Movie create', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('SUCCESS - 201', async ({ client }) => {
    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)

    const res = await client.post('/api/movies').json({
      name: "Test1",
      duration: 120
    }).bearerToken(token.value!.release())

    res.assertCreated()
  })

  test('FAIL - 403', async ({ client }) => {
    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

    const res = await client.post('/api/movies').json({
      name: "Test1",
      duration: 120
    }).bearerToken(token.value!.release())

    res.assertForbidden()
  })

  test('Fail - 422', async ({ client }) => {
    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)

    const res = await client.post('/api/movies').json({
      name: "Te", //movie name with a length of 2
      duration: 120
    }).bearerToken(token.value!.release())

    res.assertUnprocessableEntity()
  })
})
