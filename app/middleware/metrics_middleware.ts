import type { HttpContext } from '@adonisjs/core/http'
import { Counter, Histogram, register } from 'prom-client'

const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status_code'],
})

const httpDurationHistogram = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status_code'],
})

export default class MetricsMiddleware {
  public async handle({ request, response, route }: HttpContext, next: () => Promise<void>) {
    const end = httpDurationHistogram.startTimer()

    await next()

    const method = request.method()
    const statusCode = response.response.statusCode
    const routeName = route?.pattern || request.url()

    httpRequestCounter.inc({ method, route: routeName, status_code: statusCode })
    end({ method, route: routeName, status_code: statusCode })
  }
}
