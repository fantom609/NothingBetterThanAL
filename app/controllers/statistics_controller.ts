import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Session from '#models/session'
import Movie from '#models/movie'
import Room from '#models/room'
import User from '#models/user'
import Ticket from '#models/ticket'

export default class StatisticsController {
  /**
   * Obtenir les statistiques globales des sessions avec pagination et filtres
   */
  async index({ request, response, logger }: HttpContext) {
    logger.info('Statistiques globales demandées')

    const page = request.input('page', 1)
    let limit = request.input('limit', 25)
    const startDate = request.input('start_date')
    const endDate = request.input('end_date')

    if (limit > 50) {
      logger.warn(`Limite dépassée, la limite est maintenant fixée à 50 au lieu de ${limit}`)
      limit = 50
    }

    try {
      let query = Session.query()

      if (startDate) {
        query = query.where('start', '>=', DateTime.fromISO(startDate).toSQL())
      }
      if (endDate) {
        query = query.where('end', '<=', DateTime.fromISO(endDate).toSQL())
      }

      const sessions = await query.paginate(page, limit)

      const totalSessions = await Session.query().count('* as total')
      const totalTicketsSold = await Ticket.query().count('* as total')

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
        totalSessions: totalSessions[0].total,
        totalTicketsSold: totalTicketsSold[0].total,
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

  /**
   * Statistiques en temps réel du taux de fréquentation
   */
  async realTimeStats({ response, logger }: HttpContext) {
    logger.info('Statistiques en temps réel demandées')

    try {
      const totalRooms = await Room.query().count('* as total')
      const activeSessions = await Session.query().where('start', '<=', DateTime.now().toSQL())
        .where('end', '>=', DateTime.now().toSQL()).count('* as active')

      const totalTicketsSold = await Ticket.query().count('* as total')
      const activeTickets = await Ticket.query().where('created_at', '>=', DateTime.now().minus({ hours: 1 }).toSQL()).count('* as recent')

      const statistics = {
        totalRooms: totalRooms[0].total,
        activeSessions: activeSessions[0].active,
        totalTicketsSold: totalTicketsSold[0].total,
        activeTickets: activeTickets[0].recent,
      }

      logger.info('Statistiques en temps réel récupérées avec succès')
      return response.status(200).json(statistics)
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques en temps réel', error)
      return response.status(500).json({ error: 'Erreur interne du serveur' })
    }
  }
}
