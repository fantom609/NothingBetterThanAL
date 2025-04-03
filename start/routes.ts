/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import {middleware} from "#start/kernel";

const MoviesController = () => import('#controllers/movies_controller')
const RoomsController = () => import('#controllers/rooms_controller')
const SessionsController = () => import('#controllers/sessions_controller')
const UsersController = () => import('#controllers/users_controller')
const AuthController = () => import('#controllers/auth_controller')
const TransactionController = () => import('#controllers/transactions_controller')
const StatisticsController = () => import('#controllers/statistics_controller')


router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

// Renders Swagger-UI and passes YAML-output of /swagger
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
  // return AutoSwagger.default.scalar('/swagger') // to use Scalar instead. If you want, you can pass proxy url as second argument here.
  // return AutoSwagger.default.rapidoc("/swagger", "view"); // to use RapiDoc instead (pass "view" default, or "read" to change the render-style)
})

router
  .group(() => {
    router.resource('users', UsersController).apiOnly().params({id: 'id'}).where('id', router.matchers.uuid()).use(['index', 'show'], middleware.auth())
    router.resource('users.transactions', TransactionController).apiOnly().params({users: 'user', transactions: 'transaction'}).where('id', router.matchers.uuid()).use('*', middleware.auth())
    router
      .group(() => {
        router.get('/indexAll', [TransactionController, 'indexAll'])
      })
      .prefix('transactions')
      .use(middleware.auth())
    router
      .group(() => {
        router.post('/buySuperTicket', [TransactionController, 'buySuperTicket'])
      })
      .prefix('transactions')
      .use(middleware.auth())
    router.resource('rooms', RoomsController).apiOnly().params({id: 'id'}).where('id', router.matchers.uuid()).use('*', middleware.auth())
    router
      .group(() => {
        router.get('/:id/planning', [RoomsController, 'showPlanning']).where('id', router.matchers.uuid())
      })
      .prefix('rooms').use(middleware.auth())
    router.resource('sessions', SessionsController).params({id: 'id'}).where('id', router.matchers.uuid()).apiOnly().use('*', middleware.auth())
    router
      .group(() => {
        router.post('/:id/buy', [SessionsController, 'buyTicket'])
      })
      .prefix('sessions')
      .use(middleware.auth())
    router.resource('movies', MoviesController).params({id: 'id'}).where('id', router.matchers.uuid()).apiOnly().where('id', router.matchers.uuid()).use('*', middleware.auth())
    router
      .group(() => {
        router
          .get('/:id/planning', [MoviesController, 'showPlanning'])
          .where('id', router.matchers.uuid())
      })
      .prefix('movies')
      .use(middleware.auth())
    router
      .group(() => {
        router.post('login', [AuthController, 'login'])
        router.delete('logout', [AuthController, 'logout']).use(middleware.auth())
      })
      .prefix('auth')
    router
      .group(() => {
        router.get('/realTime', [StatisticsController, 'realTimeStats'])
      })
      .prefix('statistics')
      .use(middleware.auth())
  })
  .prefix('api')


