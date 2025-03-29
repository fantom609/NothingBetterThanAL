import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Session from '#models/session'
import Movie from '#models/movie'
import Room from '#models/room'
import Transaction from '#models/transaction'
import { TransactionType } from '../utils/eums.js'
import { statisticsIndexParams } from '#validators/filter'

export default class StatisticsController {
  async index({ request, response, logger }: HttpContext) {
    logger.info('Statistiques globales demandées')

    await request.validateUsing(statisticsIndexParams)

    const page = request.input('page', 1)
    let limit = request.input('limit', 25)
    const startDate = request.input('start_date')
    const endDate = request.input('end_date')

    if (limit > 50) {
      logger.warn(`Limite dépassée, réglée à 50 au lieu de ${limit}`)
      limit = 50
    }

    try {
      let query = Session.query().preload('movie').preload('room')

      if (startDate) {
        const start = DateTime.fromISO(startDate)
        if (start.isValid) {
          query = query.where('start', '>=', start.toSQL()!)
        }
      }
      if (endDate) {
        const end = DateTime.fromISO(endDate)
        if (end.isValid) {
          query = query.where('end', '<=', end.toSQL()!)
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

      logger.info('Statistiques récupérées avec succès')
      return response.status(200).json(statistics)
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques', error)
      return response.status(500).json({ error: 'Erreur interne du serveur' })
    }
  }

  async realTimeStats({ response, logger }: HttpContext) {
    logger.info('Statistiques en temps réel demandées')

    try {
      const now = DateTime.now().toSQL()!
      const lastHour = DateTime.now().minus({ hours: 1 }).toSQL()!

      const totalRooms = (await Room.query().count('* as total').first()) as {
        total: number
      } | null
      const activeSessions = (await Session.query()
        .where('start', '<=', now)
        .where('end', '>=', now)
        .count('* as active')
        .first()) as { active: number } | null

      const totalTicketsSold = (await Transaction.query()
        .where('type', TransactionType.TICKET)
        .count('* as total')
        .first()) as { total: number } | null
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

      logger.info('Statistiques en temps réel récupérées avec succès')
      return response.status(200).json(statistics)
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques en temps réel', error)
      return response.status(500).json({ error: 'Erreur interne du serveur' })
    }
  }
}
