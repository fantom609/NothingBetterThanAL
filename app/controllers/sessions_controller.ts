import type { HttpContext } from '@adonisjs/core/http'
import { sessionIndexParams } from '#validators/filter'
import Session from '#models/session'
import { createSessionValidator, editSessionValidator } from '#validators/session'
import { DateTime } from 'luxon'
import Movie from '#models/movie'
import Room from '#models/room'
import { buyTicketValidator } from '#validators/transaction'
import User from '#models/user'
import Superticket from '#models/superticket'
import TransactionPolicy from '#policies/transaction_policy'
import Transaction from '#models/transaction'
import { TransactionType } from '../utils/eums.js'
import SessionPolicy from '#policies/session_policy'

export default class SessionsController {
  /**
   * @index
   * @paramQuery page - page - @type(number) @required @example(1)
   * @paramQuery limit - limit - @type(number) @required @example(10)
   * @paramQuery sort - sort - @type(string) @example(id)
   * @paramQuery order - order - @enum(asc, desc)
   * @paramQuery name - filter - @type(string)
   * @responseBody 200 - <Session[]>.with(authorization).paginated(data, meta)
   * @responseBody 400 - {"message": "string"} - Bad request
   * @responseBody 404 - {"message": "string"} - User not found
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   * @authorization Bearer token required - Access is restricted to authenticated users
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

      const sessions = await query
        .whereHas('room', (roomQuery) => {
          roomQuery.where('maintenance', false)
        })
        .preload('room')
        .preload('movie')
        .preload('tickets')
        .paginate(page, limit)

      sessions.baseUrl('/sessions')

      const modifiedSessions = sessions.toJSON()
      modifiedSessions.data = modifiedSessions.data.map((session) => {
        const sold = session.tickets.length
        const available = session.room.capacity - sold
        return {
          id: session.id,
          room: session.room,
          movie: session.movie,
          tickets: session.tickets,
          start: session.start,
          end: session.end,
          price: session.price,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          sold,
          available,
        }
      })


      logger.info(`Successfully retrieved ${modifiedSessions.meta.total} sessions`)

      return response.status(200).json(modifiedSessions)
    } catch (error) {
      logger.error('Error retrieving sessions ', error)
      return response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * @store
   * @requestBody { "roomId": "TO COMPLETE", "movieId": "TO COMPLETE" , "start": "2025-05-23T18:30:00.000Z", "price": 10}
   * @responseBody 400 - {"message": "string"} - Invalid credentials
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   * @authorization Bearer token required - Access is restricted to authenticated users
   */
  async store({ request, response, logger, bouncer }: HttpContext) {
    if(await bouncer.with(SessionPolicy).denies('store')){
      logger.warn('User is not authorized to create a session')
      return response.forbidden('Cannot create a session')
    }

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
   * @show
   * @responseBody 400 - {"message": "Invalid credentials"} - Access denied or token missing
   * @responseBody 500 - {"message": "Internal server error"} - Unexpected error
   * @authorization Bearer token required - Access is restricted to authenticated users
   */
  async show({ params, response }: HttpContext) {
    const session = await Session.query().where('id', params.id).preload('room').preload('movie')
    return response.status(200).send(session)
  }

  /**
   * @update
   * @requestBody {"start": "2025-06-23T18:30:00.000Z"}
   * @responseBody 400 - {"message": "string"} - Invalid credentials
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   * @authorization Bearer token required - Access is restricted to authenticated users
   */
  async update({ params, request, response, logger, bouncer }: HttpContext) {
    if(await bouncer.with(SessionPolicy).denies('update')){
      logger.warn('User is not authorized to create a session')
      return response.forbidden('Cannot create a session')
    }

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
          qb.whereBetween('start', [!start.toSQL(), !end.toSQL()])
            .orWhereBetween('end', [!start.toSQL(), !end.toSQL()])
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
          qb.whereBetween('start', [!start.toSQL(), !end.toSQL()])
            .orWhereBetween('end', [!start.toSQL(), !end.toSQL()])
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
   * @destroy
   * @responseBody 400 - {"message": "string"} - Invalid credentials
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   * @responseBody 200 - {message: "Successfully retrieved"}
   * @authorization Bearer token required - Access is restricted to authenticated users
   */
  async destroy({ params, response, bouncer, logger }: HttpContext) {
    if(await bouncer.with(SessionPolicy).denies('destroy')){
      logger.warn('User is not authorized to create a session')
      return response.forbidden('Cannot create a session')
    }
    const session = await Session.query().preload('tickets').where('id', params.id).firstOrFail()

    if(session.tickets.length > 0){
      session.tickets.forEach((ticket) => {
        console.log(ticket)
      })
    }

    return response.status(204).send({ message: 'Successfully deleted' })
  }

  /**
   * @buyTicket
   * @requestBody { "superTicket": false }
   * @responseBody 200 - {"id": "string", "userId": "string", "remainingUses": number, "transactionId": "string", "createdAt": "string", "updatedAt": "string"}
   * @responseBody 400 - {"message": "string"} - Invalid credentials
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   * @authorization Bearer token required - Access is restricted to authenticated users
   */
  async buyTicket({ params, request, response, auth, bouncer, logger }: HttpContext) {
    const payload = await request.validateUsing(buyTicketValidator)

    const session = await Session.query()
      .where('id', params.id)
      .preload('movie')
      .preload('tickets')
      .preload('room')
      .firstOrFail()

    if(session.tickets.length === session.room.capacity){
      logger.warn(`Room ${session.room.name} is full`)
      return response.status(401).json({ message: 'Room is full' })
    }

    const user = await User.findOrFail(auth.user!.id)

    const isTicketExist = await Session.query()
      .whereHas('tickets', (query) => {
        query.where('user_id', auth.user!.id)
          .where('session_id', params.id)
      })
      .first()

    if( isTicketExist) {
      logger.warn(`${user.name} ${user.forname} already has a ticket for ${session.movie.name}`)
      return response.status(403).json({ message: 'Ticket already exists' })
    }

    if (payload.superTicket === true) {
      await Superticket.query()
        .where('user_id', auth.user!.id)
        .where('remaining_uses', '>', 0)
        .firstOrFail()
    }

    if (
      (await bouncer.with(TransactionPolicy).denies('buyTicket', session)) &&
      payload.superTicket === false
    ) {
      logger.warn(`${user.name} ${user.forname} doesn't have enough money`)
      return response.forbidden('Cannot buy a Ticket. Not enough money.')
    }

    if (payload.superTicket === true) {
      const transaction = await Transaction.create({
        type: TransactionType.TICKET,
        userId: auth.user!.id,
        amount: 0,
        balance: user.balance,
      })

      const superTicket = await Superticket.query()
        .where('user_id', auth.user!.id)
        .where('remaining_uses', '>', 0)
        .firstOrFail()

      superTicket.remainingUses -= 1

      await superTicket.save()

      await user.related('tickets').attach({
        [session.id]: {
          transaction_id: transaction.id,
          superticket_id: superTicket.id,
        },
      })
    } else {
      const transaction = await Transaction.create({
        type: TransactionType.TICKET,
        userId: auth.user!.id,
        amount: session.price * -1,
        balance: user.balance - session.price,
      })

      user.balance -= session.price
      await user.save()

      await user.related('tickets').attach({
        [session.id]: {
          transaction_id: transaction.id,
          superticket_id: null,
        },
      })
    }

    const ticket = await Session.query()
      .whereHas('tickets', (query) => {
        query.where('user_id', auth.user!.id).where('session_id', params.id)
      })
      .preload('tickets')
      .first()

    return response.status(201).json(ticket)

  }

}
