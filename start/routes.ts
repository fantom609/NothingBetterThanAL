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

const MoviesController = () => import('#controllers/movies_controller')
const RoomsController = () => import('#controllers/rooms_controller')
const SessionsController = () => import('#controllers/sessions_controller')
const UsersController = () => import('#controllers/users_controller')

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
      router.resource('users', MoviesController).apiOnly()
      router.resource('rooms', RoomsController).apiOnly()
      router.resource('sessions', SessionsController).apiOnly()
      router.resource('movies', UsersController).apiOnly()
  })
  .prefix('api')


