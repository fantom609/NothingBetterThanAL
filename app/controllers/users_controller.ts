import type { HttpContext } from '@adonisjs/core/http'
import { createUserValidator, patchUserValidator } from "#validators/user";
import User from '#models/user'
import { userIndexParams } from '#validators/filter'
import UserPolicy from '#policies/user_policy'
import MoviePolicy from '#policies/movie_policy'
import { UserRoles } from '../utils/eums.js'

export default class UsersController {
  /**
   * @index
   * @paramQuery page - page - @type(number) @required @example(1)
   * @paramQuery limit - limit - @type(number) @required @example(10)
   * @paramQuery sort - sort - @type(string) @example(id)
   * @paramQuery order - order - @enum(asc, desc)
   * @paramQuery name - filter - @type(string)
   * @responseBody 200 - <User[]>.with(authorization).paginated(data, meta)
   * @responseBody 400 - {"message": "string"} - Bad request
   * @responseBody 404 - {"message": "string"} - User not found
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   * @authorization Bearer token required - Access is restricted to authenticated users
   */
  async index({ logger, response, request, bouncer}: HttpContext) {
    logger.info('Index method called')

    if (await bouncer.with(UserPolicy).denies('index')) {
      logger.warn('User is not authorized to index a room')
      return response.forbidden('Cannot get users')
    }

    await request.validateUsing(userIndexParams)

    const page = request.input('page', 1)
    let limit = request.input('limit', 25)
    const sort = request.input('sort', 'id')
    const order = request.input('order', 'asc')
    const filters = request.only([
      'id',
      'name',
      'forname',
      'email',
      'role',
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
      let query = User.query().orderBy(sort, order)

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

      const users = await query.paginate(page, limit)

      users.baseUrl('/users')
      logger.info(`Successfully retrieved ${users.getMeta().total} rooms`)

      return response.status(200).json(users)
    } catch (error) {
      logger.error('Error retrieving users ', error)
      return response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * @store
   * @requestBody {"name": "Machavoine", "forname": "Rémy", "balance": 10, "email": "rm@gmail.com", "password":"Esgi1234" }
   * @responseBody 400 - {"message": "string"} - Invalid credentials
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   * @authorization Bearer token required - Access is restricted to authenticated users
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)

    const email = await User.findBy({ email: payload.email})

    if(email) {
      response.status(422).json({"message": "Email already exists"})
      return
    }

    const user = await User.create({
      ...payload,
      role: "USER",
    })

    response.status(201).json(user)
  }

  /**
   * Show individual record
   */
  async show({ params, response, bouncer, logger }: HttpContext) {

    if (await bouncer.with(UserPolicy).denies('index')) {
      logger.warn('User is not authorized to show a room')
      return response.forbidden('Cannot show a room')
    }

    const user = await User.query().where('id', params.id).preload('tickets').preload('superticket').preload('transactions').firstOrFail()

    response.ok(user)
  }

  /**
   * @update
   * @requestBody {"name": "Mchvn" }
   * @responseBody 400 - {"message": "string"} - Invalid credentials
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   * @authorization Bearer token required - Access is restricted to authenticated users
   */
  async update({ params, response, request, auth, logger }: HttpContext) {
    const payload = await request.validateUsing(patchUserValidator)
    const user = await User.findOrFail(params.id)

    if(payload.role){
      if(auth.user!.role !== (UserRoles.ADMIN || UserRoles.SUPERADMIN)){
        logger.warn('User is not authorized to update a user')
        return response.forbidden('Cannot update a user')
      }
    }
    const patchUser = await user.merge(payload).save()

    response.ok(patchUser)
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
    const user = await User.findOrFail(params.id)

    if (await bouncer.with(UserPolicy).denies('destroy', user)) {
      logger.warn('User is not authorized to delete a user')
      return response.forbidden('Cannot delete a user')
    }

    await user.delete()

    response.noContent()
  }
}
