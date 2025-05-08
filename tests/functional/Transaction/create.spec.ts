import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'

test.group('Transaction create', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('SUCCESS - 200 - WITHDRAW', async ({ client }) => {
    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

    const res = await client.post(`/api/users/${user.id}/transactions`).json({
        type: 'WITHDRAW',
        amount: 10,
    }).bearerToken(token.value!.release())

    res.assertCreated()
  })

  test('SUCCESS - 200 - DEPOSIT', async ({ client }) => {
    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

    const res = await client.post(`/api/users/${user.id}/transactions`).json({
      type: 'DEPOSIT',
      amount: 10,
    }).bearerToken(token.value!.release())

    res.assertCreated()
  })

  test('SUCCESS - 200 - SUPERTICKET', async ({ client }) => {
    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

    const res = await client.post(`/api/transactions/superticket`).bearerToken(token.value!.release())

    res.assertCreated()
  })

  test('FAIL - 401 - NOT ENOUGH MONEY', async ({ client }) => {
    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

    const res = await client.post(`/api/users/${user.id}/transactions`).json({
        type: 'WITHDRAW',
        amount: 2000,
    }).bearerToken(token.value!.release())

    res.assertUnauthorized()
  })

  test('FAIL - 401 - WRONG PAYLOAD', async ({ client }) => {
    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

    const res = await client.post(`/api/users/${user.id}/transactions`).json({
      type: 'COUCOU',
      amount: 10,
    }).bearerToken(token.value!.release())

    res.assertUnprocessableEntity()
  })
})
