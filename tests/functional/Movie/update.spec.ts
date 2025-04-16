import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Movie from '#models/movie'

test.group('Movie update', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('SUCCESS  - 200', async ({ client }) => {
    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)

    const movie = await Movie.create({
      name: 'Test1',
      duration: 120,
    })

    const res = await client.patch('/api/movies/' + movie.id).json({
        name: 'joijoqjdioqsjdi',
    }).bearerToken(token.value!.release())

    res.assertOk()
  })

  test('Fail - 403', async ({ client }) => {
    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

    const movie = await Movie.create({
      name: 'Test1',
      duration: 120,
    })

    const res = await client.patch('/api/movies/' + movie.id).json({
      name: 'joijoqjdioqsjdi',
    }).bearerToken(token.value!.release())

    res.assertForbidden()
  })

  test('Fail - 422', async ({ client }) => {
    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)

    const movie = await Movie.create({
      name: 'Test1',
      duration: 120,
    })

    const res = await client.patch('/api/movies/' + movie.id).json({
      duration: 12000
    }).bearerToken(token.value!.release())

    res.assertUnprocessableEntity()
  })
})
