import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Auth login', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('SUCCESS - 200', async ({ client }) => {

    const res = await client.post('/api/auth/login').json({
      email: 'admin@cinema.com',
      password: 'Cinema1234',
    })

    res.assertOk()
  })

  test('FAIL - 400', async ({ client }) => {

    const res = await client.post('/api/auth/login').json({
      email: 'admin@cinema.com',
      password: 'nema1234',
    })

    res.assertStatus(400)
  })
})
