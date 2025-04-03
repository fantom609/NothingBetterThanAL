import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { realTimeStatistics} from '#validators/filter'
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
      const movieCounts = tickets.reduce((acc, ticket) => {
        const movieId = ticket.session.movie.id
        acc[movieId] = (acc[movieId] || 0) + 1
        return acc
      }, {})

      const mostWatchedMovieId = Object.keys(movieCounts).reduce((a, b) => movieCounts[a] > movieCounts[b] ? a : b);
      const mostWatchedMovie = tickets.find(
        (ticket) => ticket.session.movie.id.toString() === mostWatchedMovieId
      )

      return response.status(200).json({
        totalPrice: totalPrice,
        totalTickets: tickets.length,
        topSession: {
          session: topSession.session.id,
          price: topSession.session.price,
          movieTitle: topSession.session.movie.name,
        },
        mostWatchedMovie: mostWatchedMovie.session.movie.name,
      })
    }

    return response.status(200).json({})
  }
}
