import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Session from '#models/session'
import Movie from '#models/movie'
import Room from '#models/room'
import Transaction from '#models/transaction'
import { TransactionType } from '../utils/eums.js'
import {realTimeStatistics, statisticsIndexParams} from '#validators/filter'

export default class StatisticsController {
  /**
   * Retrieve statistics with optional date filters
   */
  async index({ request, response, logger }: HttpContext) {
    logger.info('Global statistics requested')

    await request.validateUsing(statisticsIndexParams)

    const page = request.input('page', 1)
    let limit = request.input('limit', 25)
    const startDate = request.input('start_date')
    const endDate = request.input('end_date')

    if (limit > 50) {
      logger.warn(`Limit exceeded, adjusting to 50 instead of ${limit}`)
      limit = 50
    }

    try {
      let query = Session.query().preload('movie').preload('room')

      // Apply date filters if provided
      if (startDate) {
        const start = DateTime.fromISO(startDate)
        if (start.isValid) {
          query = query.where('start', '>=', start.toSQL())
        }
      }
      if (endDate) {
        const end = DateTime.fromISO(endDate)
        if (end.isValid) {
          query = query.where('end', '<=', end.toSQL())
        }
      }

      const sessions = await query.paginate(page, limit)
      sessions.baseUrl('/statistics')

      const totalSessions = (await Session.query().count('* as total').first()) as {
        total: number
      } | null
      const totalTicketsSold = (await Transaction.query()
        .where('type', TransactionType.TICKET)
        .count('* as total')
        .first()) as { total: number } | null

      const movieStats = await Movie.query()
        .select('title')
        .count('* as totalSessions')
        .leftJoin('sessions', 'movies.id', 'sessions.movieId')
        .groupBy('movies.id')

      const roomStats = await Room.query()
        .select('name')
        .count('* as totalSessions')
        .leftJoin('sessions', 'rooms.id', 'sessions.roomId')
        .groupBy('rooms.id')

      const statistics = {
        totalSessions: totalSessions?.total ?? 0,
        totalTicketsSold: totalTicketsSold?.total ?? 0,
        movieStats,
        roomStats,
        sessions: sessions.toJSON(),
      }

      logger.info('Statistics retrieved successfully')
      return response.status(200).json(statistics)
    } catch (error) {
      logger.error('Error retrieving statistics', error)
      return response.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * @realTimeStats
   * @paramQuery start - start - @type(string) @required
   * @paramQuery end - end - @type(string) @required
   * @responseBody 400 - {"message": "string"} - Bad request
   * @responseBody 404 - {"message": "string"} - User not found
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   * @authorization Bearer token required - Access is restricted to authenticated users
   */
  async realTimeStats({ request, logger }: HttpContext) {
    logger.info('Real-time statistics requested')

    await request.validateUsing(realTimeStatistics)

    const start = request.input('start')
    const end = request.input('end')
    
  }
}
