import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { realTimeStatistics } from '#validators/filter'
import Ticket from '#models/ticket'

export default class StatisticsController {
  /**
   * @realTimeStats
   * @paramQuery start - start - @type(string) @required
   * @paramQuery end - end - @type(string) @required
   * @responseBody 400 - {"message": "string"} - Bad request
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   * @authorization Bearer token required - Access is restricted to authenticated users
   */
  async realTimeStats({ response, request, logger }: HttpContext) {
    logger.info('Real-time statistics requested')

    await request.validateUsing(realTimeStatistics)

    let start = request.input('start')
    let end = request.input('end')

    start = DateTime.fromISO(start).startOf('day').toUTC().toISO()
    end = DateTime.fromISO(end).startOf('day').toUTC().toISO()

    const tickets = await Ticket.query()
      .preload('session', (sessionQuery) => {
        sessionQuery.preload('movie')
      })
      .where('tickets.created_at', '>', start)
      .where('tickets.created_at', '<', end)
      .whereNull('tickets.superticket_id')

    const totalPrice = tickets.reduce((sum, ticket) => sum + ticket.session.price, 0)

    const topSession = tickets.reduce((maxTicket, ticket) => {
      return ticket.session.price > maxTicket.session.price ? ticket : maxTicket
    }, tickets[0])

    if (tickets.length > 0) {
      const movieCounts = tickets.reduce((acc: { [key: string]: number }, ticket) => {
        const movieId = ticket.session.movie.id
        acc[movieId] = (acc[movieId] || 0) + 1
        return acc
      }, {})

      const mostWatchedMovieId = Object.keys(movieCounts).reduce((a, b) =>
        movieCounts[a] > movieCounts[b] ? a : b
      )
      const mostWatchedMovie = tickets.find(
        (ticket) => ticket.session.movie.id.toString() === mostWatchedMovieId
      )

      return response.status(200).json({
        totalPrice: totalPrice,
        totalTickets: tickets.length,
        topSession: {
          sessionId: topSession.session.id,
          price: topSession.session.price,
          movie: topSession.session.movie,
        },
        mostWatchedMovie: mostWatchedMovie!.session.movie.name,
      })
    }

    return response.status(200).json({})
  }

  /**
   * @dailyAttendanceStats
   * @responseBody 200 - {"dailyTickets": number, "dailyRevenue": number, "attendanceRate": "string"}
   * @responseBody 500 - {"message": "string"} - Internal server error
   * @authorization Bearer token required - Access is restricted to authenticated users
   */
  async dailyAttendanceStats({ response, logger }: HttpContext) {
    logger.info('Daily attendance stats requested')

    try {
      const todayStart = DateTime.now().startOf('day').toUTC().toISO()
      const todayEnd = DateTime.now().endOf('day').toUTC().toISO()

      const yesterdayStart = DateTime.now().minus({ days: 1 }).startOf('day').toUTC().toISO()
      const yesterdayEnd = DateTime.now().minus({ days: 1 }).endOf('day').toUTC().toISO()

      const todayTickets = await Ticket.query()
        .preload('session', (query) => query.preload('movie'))
        .where('created_at', '>=', todayStart)
        .andWhere('created_at', '<=', todayEnd)
        .whereNull('superticket_id')

      const dailyRevenue = todayTickets.reduce((sum, ticket) => sum + ticket.session.price, 0)
      const todayCount = todayTickets.length

      // Tickets hier
      const yesterdayCountRaw = await Ticket.query()
        .where('created_at', '>=', yesterdayStart)
        .andWhere('created_at', '<=', yesterdayEnd)
        .whereNull('superticket_id')
        .count('* as total')

      const yesterdayCount = Number(yesterdayCountRaw[0].$extras.total)

      // Calcul du taux de fréquentation
      let attendanceRate = 0
      if (yesterdayCount > 0) {
        attendanceRate = ((todayCount - yesterdayCount) / yesterdayCount) * 100
      } else if (todayCount > 0) {
        attendanceRate = 100
      }

      return response.status(200).json({
        dailyTickets: todayCount,
        dailyRevenue: dailyRevenue,
        attendanceRate: attendanceRate.toFixed(2) + '%',
      })
    } catch (error) {
      logger.error('Error in dailyAttendanceStats', error)
      return response.status(500).json({ message: 'Internal server error' })
    }
  }
}
