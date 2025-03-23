import type { HttpContext } from '@adonisjs/core/http'
import { createMovieValidator, editMovieValidator, showMovieValidator } from '#validators/movie'
import Movie from '#models/movie'
import { movieIndexParams } from '#validators/filter'
import MoviePolicy from '#policies/movie_policy'
import { showPlanningValidator } from '#validators/room'
import Session from '#models/session'

export default class MoviesController {
  /**
   * Display a list of resource
   */
  async index({ request, logger, response }: HttpContext) {
    logger.info('Index method called')

    await request.validateUsing(movieIndexParams)

    const page = request.input('page', 1)
    let limit = request.input('limit', 25)
    const sort = request.input('sort', 'id')
    const order = request.input('order', 'asc')
    const filters = request.only(['id', 'name', 'duration', 'createdAt', 'updatedAt'])

    logger.info(
      `Request parameters - page: ${page}, limit: ${limit}, sort: ${sort}, order: ${order}`
    )

    if (limit > 50) {
      logger.warn(`Limit exceeded, setting limit to 50 instead of ${limit}`)
      limit = 50
    }

    try {
      let query = Movie.query().orderBy(sort, order)

      for (const [key, value] of Object.entries(filters)) {
        if (value) {
          if (['createdAt', 'updatedAt'].includes(key)) {
            const date = new Date(value)
            if (!Number.isNaN(date.getTime())) {
              query = query.where(key, '>=', date.toISOString().split('T')[0])
              logger.info(`Date filter applied: ${key} >= ${value}`)
            }
          } else {
            query = query.where(key, 'LIKE', `%${value}%`)
            logger.info(`Filter applied: ${key} LIKE %${value}%`)
          }
        }
      }

      const movie = await query.paginate(page, limit)

      movie.baseUrl('/movies')
      logger.info(`Successfully retrieved ${movie.getMeta().total} movies`)

      return response.status(200).json(movie)
    } catch (error) {
      logger.error('Error retrieving movies ', error)
      return response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, logger, bouncer }: HttpContext) {
    if (await bouncer.with(MoviePolicy).denies('store')) {
      logger.warn('User is not authorized to index a movie')
      return response.forbidden('Cannot create a movie')
    }

    const payload = await request.validateUsing(createMovieValidator)
    const movie = await Movie.firstOrCreate({
      name: payload.name,
      duration: payload.duration,
    })

    return response.status(201).send(movie)
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const movie = await Movie.findOrFail(params.id)
    return response.status(200).send(movie)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, bouncer, logger }: HttpContext) {
    if (await bouncer.with(MoviePolicy).denies('update')) {
      logger.warn('User is not authorized to update a movie')
      return response.forbidden('Cannot create a movie')
    }

    const movie = await Movie.findOrFail(params.id)
    const payload = await request.validateUsing(editMovieValidator)

    movie.name = payload.name ? payload.name : movie.name
    movie.duration = payload.duration ? payload.duration : movie.duration

    await movie.save()

    return response.status(200).send(movie)
  }

  /**
   * Delete record
   */
  async destroy({ params, response, bouncer, logger }: HttpContext) {

    if (await bouncer.with(MoviePolicy).denies('destroy')) {
      logger.warn('User is not authorized to destroy a movie')
      return response.forbidden('Cannot create a movie')
    }

    const movie = await Movie.findOrFail(params.id)
    await movie.delete()

    return response.status(204).send({ message: 'Successfully deleted' })
  }

  async showPlanning({ params, response, request, logger }: HttpContext) {
    logger.info(`ShowPlanning method called for film ID: ${params.id}`)

    await request.validateUsing(showMovieValidator)

    const startDate = request.input('startDate')
    const endDate = request.input('endDate')
    const page = request.input('page', 1)
    let limit = request.input('limit', 25)

    if (limit > 50) {
      logger.warn(`Limit exceeded, setting limit to 50 instead of ${limit}`)
      limit = 50
    }

    const sessions = await Session.query()
      .whereHas('movie', (movieQuery) => {
        movieQuery.where('id', params.id)
      })
      .where('start', '>=', startDate)
      .where('start', '<=', endDate)
      .paginate(page, limit)

    logger.info(`Successfully retrieved ${sessions.getMeta().total} sessions for room ID ${params.id}`)
    return response.status(200).send(sessions)
  }
}
