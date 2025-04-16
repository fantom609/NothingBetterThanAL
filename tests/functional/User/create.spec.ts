import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('User create', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('SUCCESS - 201', async ({ client }) => {

    const res = await client.post('/api/users').json({
      email: 'test@gmail.com',
      password: 'TestDoe20',
      balance: 1000,
      name: 'john',
      forname: 'Doe',
      role: 'USER',
    })

    res.assertCreated()
  })

  test('Fail - 422', async ({ client }) => {

    const res = await client.post('/api/users').json({
      email: 'test@gmail.com',
      password: '1', // password with length of 1
      balance: 1000,
      name: 'john',
      forname: 'Doe',
      role: 'USER',
    })

    res.assertUnprocessableEntity()
  })
})
