import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group('Auth logout', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('SUCCESS - 200', async ({ client }) => {
    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)

    const res = await client.delete('/api/auth/logout').bearerToken(token.value!.release())

    res.assertOk()
  })

  test('FAIL - 400', async ({ client }) => {

    const res = await client.delete('/api/auth/logout')

    res.assertUnauthorized()
  })
})
