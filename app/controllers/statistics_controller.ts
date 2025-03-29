import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Session from '#models/session'
import Movie from '#models/movie'
import Room from '#models/room'
import Transaction from '#models/transaction'
import { TransactionType } from '../utils/eums.js'
import { statisticsIndexParams } from '#validators/filter'

export default class StatisticsController {
  /**
   * Retrieve statistics with optional date filters
   */
  async index({ request, response, logger }: HttpContext) {
    logger.info('Global statistics requested')

    // Validate the request parameters
    await request.validateUsing(statisticsIndexParams)

    const page = request.input('page', 1)
    let limit = request.input('limit', 25)
    const startDate = request.input('start_date')
    const endDate = request.input('end_date')

    // Handle the limit restriction
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

      // Retrieve total statistics
      const totalSessions = (await Session.query().count('* as total').first()) as { total: number } | null
      const totalTicketsSold = (await Transaction.query()
        .where('type', TransactionType.TICKET)
        .count('* as total')
        .first()) as { total: number } | null

      // Movie statistics
      const movieStats = await Movie.query()
        .select('title')
        .count('* as totalSessions')
        .leftJoin('sessions', 'movies.id', 'sessions.movieId')
        .groupBy('movies.id')

      // Room statistics
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
   * Retrieve real-time statistics
   */
  async realTimeStats({ response, logger }: HttpContext) {
    logger.info('Real-time statistics requested')

    try {
      const now = DateTime.now().toSQL()
      const lastHour = DateTime.now().minus({ hours: 1 }).toSQL()

      // Total rooms count
      const totalRooms = (await Room.query().count('* as total').first()) as { total: number } | null

      // Active sessions count
      const activeSessions = (await Session.query()
        .where('start', '<=', now)
        .where('end', '>=', now)
        .count('* as active')
        .first()) as { active: number } | null

      // Total tickets sold count
      const totalTicketsSold = (await Transaction.query()
        .where('type', TransactionType.TICKET)
        .count('* as total')
        .first()) as { total: number } | null

      // Tickets sold in the last hour
      const activeTickets = (await Transaction.query()
        .where('type', TransactionType.TICKET)
        .where('created_at', '>=', lastHour)
        .count('* as recent')
        .first()) as { recent: number } | null

      const statistics = {
        totalRooms: totalRooms?.total ?? 0,
        activeSessions: activeSessions?.active ?? 0,
        totalTicketsSold: totalTicketsSold?.total ?? 0,
        activeTickets: activeTickets?.recent ?? 0,
      }

      logger.info('Real-time statistics retrieved successfully')
      return response.status(200).json(statistics)
    } catch (error) {
      logger.error('Error retrieving real-time statistics', error)
      return response.status(500).json({ error: 'Internal server error' })
    }
  }
}
