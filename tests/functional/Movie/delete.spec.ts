import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Movie from '#models/movie'

test.group('Room delete', async (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('SUCCESS - 204', async ({ client }) => {
    const user = await User.verifyCredentials('admin@cinema.com', 'Cinema1234')

    const token = await User.accessTokens.create(user)


    const movie = await Movie.create({
      name: 'Test1',
      duration: 120,
    })

    const res = await client.delete('/api/movies/' + movie.id).bearerToken(token.value!.release())
    res.assertStatus(204)
  })

  test('FAIL - 403', async ({ client }) => {
    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)


    const movie = await Movie.create({
      name: 'Test1',
      duration: 120,
    })

    const res = await client.delete('/api/movies/' + movie.id).bearerToken(token.value!.release())
    res.assertForbidden()
  })

  test('FAIL - 404', async ({ client }) => {
    const user = await User.verifyCredentials('JohnDoe@gmail.com', 'JohnDoe20')

    const token = await User.accessTokens.create(user)

    const res = await client.delete('/api/movies/1').bearerToken(token.value!.release())
    res.assertNotFound()
  })
})
