import type { HttpContext } from '@adonisjs/core/http'
import { sessionIndexParams } from '#validators/filter'
import Session from '#models/session'
import { createSessionValidator, editSessionValidator } from '#validators/session'
import { DateTime } from 'luxon'
import Movie from '#models/movie'
import Room from '#models/room'

export default class SessionsController {
  /**
   * Display a list of resource
   */
  async index({ request, logger, response }: HttpContext) {
    logger.info('Index method called')

    await request.validateUsing(sessionIndexParams)

    const page = request.input('page', 1)
    let limit = request.input('limit', 25)
    const sort = request.input('sort', 'id')
    const order = request.input('order', 'asc')
    const filters = request.only([
      'id',
      'roomId',
      'movieId',
      'start',
      'end',
      'price',
      'createdAt',
      'updatedAt',
    ])

    logger.info(
      `Request parameters - page: ${page}, limit: ${limit}, sort: ${sort}, order: ${order}`
    )

    if (limit > 50) {
      logger.warn(`Limit exceeded, setting limit to 50 instead of ${limit}`)
      limit = 50
    }

    try {
      let query = Session.query().orderBy(sort, order)

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

      const session = await query
        .whereHas('room', (roomQuery) => {
          roomQuery.where('maintenance', false)
        })
        .preload('room')
        .preload('movie')
        .paginate(page, limit)

      session.baseUrl('/sessions')
      logger.info(`Successfully retrieved ${session.getMeta().total} sessions`)

      return response.status(200).json(session)
    } catch (error) {
      logger.error('Error retrieving sessions ', error)
      return response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, logger }: HttpContext) {
    const payload = await request.validateUsing(createSessionValidator)

    const room = await Room.findOrFail(payload.roomId)
    if (room.maintenance) {
      logger.error(`Error: Room ${room.name} is under maintenance`)
      return response.badRequest({
        message: "This room is under maintenance and cannot be used."
      })
    }

    const movie = await Movie.findOrFail(payload.movieId)

    const start = DateTime.fromISO(payload.start)
    if (!start.isValid) {
      return response.badRequest({
        message: "The session start date is invalid."
      })
    }

    const end = start.plus({ minutes: movie.duration + 30 })

    logger.info(`Checking for conflicts: ${start.toSQL()} → ${end.toSQL()}`)

    const overlappingSession = await Session.query()
      .where('roomId', payload.roomId)
      .where((qb) => {
        qb.whereBetween('start', [start.toSQL(), end.toSQL()])
          .orWhereBetween('end', [start.toSQL(), end.toSQL()])
      })
      .first()

    if (overlappingSession) {
      logger.warn(`Conflict detected: Another session exists in this room (${overlappingSession.id})`)
      return response.badRequest({
        message: "Another session is already scheduled in this room at this time."
      })
    }

    const conflictingMovieSession = await Session.query()
      .where('movieId', payload.movieId)
      .where(qb => {
        qb.whereBetween('start', [start.toSQL(), end.toSQL()])
          .orWhereBetween('end', [start.toSQL(), end.toSQL()])
      })
      .first()

    if (conflictingMovieSession) {
      logger.warn(`Conflict detected: This movie is already being screened in another room (${conflictingMovieSession.roomId})`)
      return response.badRequest({
        message: "This movie is already being screened in another room at this time."
      })
    }

    const session = await Session.create({
      roomId: payload.roomId,
      movieId: payload.movieId,
      start,
      end,
      price: payload.price,
    })

    logger.info(`Session created: ${session.id}`)
    return response.status(201).send(session)
  }


  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const session = await Session.query().where('id', params.id).preload('room').preload('movie')
    return response.status(200).send(session)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, logger }: HttpContext) {
    const session = await Session.findOrFail(params.id)
    const payload = await request.validateUsing(editSessionValidator)

    let room = await Room.findOrFail(session.roomId)
    let movie = await Movie.findOrFail(session.movieId)

    if (payload.roomId) room = await Room.findOrFail(payload.roomId)

    if (payload.movieId) movie = await Movie.findOrFail(payload.movieId)

    session.roomId = payload.roomId ? payload.roomId : session.roomId
    session.movieId = payload.movieId ? payload.movieId : session.movieId

    let start = session.start
    let end = session.end

    if (payload.start) {
      start = DateTime.fromISO(payload.start)
      if (!start.isValid) {
        return response.badRequest({
          message: "The session start date is invalid."
        })
      }

      end = start.plus({ minutes: movie.duration + 30 })

      const overlappingSession = await Session.query()
        .where('roomId', room.id)
        .where((qb) => {
          qb.whereBetween('start', [start.toSQL(), end.toSQL()])
            .orWhereBetween('end', [start.toSQL(), end.toSQL()])
        })
        .first()

      if (overlappingSession) {
        logger.warn(`Conflict detected: Another session exists in this room (${overlappingSession.id})`)
        return response.badRequest({
          message: "Another session is already scheduled in this room at this time."
        })
      }

      const conflictingMovieSession = await Session.query()
        .where('movieId', movie.id)
        .where((qb) => {
          qb.whereBetween('start', [start.toSQL(), end.toSQL()])
            .orWhereBetween('end', [start.toSQL(), end.toSQL()])
        })
        .first()

      if (conflictingMovieSession) {
        logger.warn(`Conflict detected: This movie is already being screened in another room (${conflictingMovieSession.roomId})`)
        return response.badRequest({
          message: "This movie is already being screened in another room at this time."
        })
      }
    }

    session.price = payload.price ? payload.price : session.price
    session.start = start
    session.end = end
    await session.save()

    return response.status(200).send(session)
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const session = await Session.findOrFail(params.id)
    await session.delete()

    return response.status(204).send({ message: 'Successfully deleted' })
  }
}
