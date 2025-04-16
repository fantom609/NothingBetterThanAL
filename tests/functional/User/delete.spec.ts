import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group('User delete', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('SUCCESS - 201', async ({ client }) => {

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

    const res = await client.delete('api/users/' + newUser.id).bearerToken(token.value!.release())

    res.assertStatus(204)
  })

  test('SUCCESS - 201 - DELETE HIS PROPER ACCOUNT', async ({ client }) => {

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

    const res = await client.delete('api/users/' + newUser.id).bearerToken(token.value!.release())

    res.assertStatus(204)
  })

  test('Fail - 401', async ({ client }) => {

    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

    const newUser = await User.create({
      email: 'TestDoe@gmail.com',
      password: 'TestDoe20',
      balance: 1000,
      name: 'john',
      forname: 'Doe',
      role: 'USER',
    })

    const res = await client.delete('api/users/' + newUser.id).bearerToken(token.value!.release())

    res.assertForbidden()
  })

  test('FAIL - 404', async ({ client }) => {

    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)

    const res = await client.delete('api/users/1').bearerToken(token.value!.release())

    res.assertNotFound()
  })

})
