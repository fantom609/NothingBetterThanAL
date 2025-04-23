import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group('User update', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('SUCCESS - 200 - ADMIN', async ({ client }) => {

    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)

    const newUser = await User.create({
      email: 'TestDoe@gmail.com',
      password: 'TestDoe20',
      balance: 1000,
      name: 'john',
      forname: 'Doe',
      role: 'USER',
    })

    const res = await client
      .patch('api/users/' + newUser.id)
      .json({
        role: 'ADMIN',
      })
      .bearerToken(token.value!.release())

    res.assertOk()
  })

  test('SUCCESS - 200 - PROPER ACCOUNT', async ({ client }) => {

    const newUser = await User.create({
      email: 'TestDoe@gmail.com',
      password: 'TestDoe20',
      balance: 1000,
      name: 'john',
      forname: 'Doe',
      role: 'USER',
    })

    const user = await User.verifyCredentials('TestDoe@gmail.com', 'TestDoe20')

    const token = await User.accessTokens.create(user)

    const res = await client
      .patch('api/users/' + newUser.id)
      .json({
        name: 'Theo',
      })
      .bearerToken(token.value!.release())

    res.assertOk()
  })

  test('FAIL - 401 - PROPER ACCOUNT', async ({ client }) => {

    const newUser = await User.create({
      email: 'TestDoe@gmail.com',
      password: 'TestDoe20',
      balance: 1000,
      name: 'john',
      forname: 'Doe',
      role: 'USER',
    })

    const user = await User.verifyCredentials('TestDoe@gmail.com', 'TestDoe20')

    const token = await User.accessTokens.create(user)

    const res = await client
      .patch('api/users/' + newUser.id)
      .json({
        role: 'ADMIN', // User can't change their role
      })
      .bearerToken(token.value!.release())

    res.assertForbidden()
  })

  test('FAIL - 422 - ADMIN', async ({ client }) => {

    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)

    const newUser = await User.create({
      email: 'TestDoe@gmail.com',
      password: 'TestDoe20',
      balance: 1000,
      name: 'john',
      forname: 'Doe',
      role: 'USER',
    })

    const res = await client
      .patch('api/users/' + newUser.id)
      .json({
        role: 'COUCOU',
      })
      .bearerToken(token.value!.release())

    res.assertUnprocessableEntity()
  })
})
