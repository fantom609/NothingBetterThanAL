import type { HttpContext } from '@adonisjs/core/http'
import {createUserValidator, patchUserValidator} from "#validators/user";
import User from "#models/user";
import {userIndexParams} from "#validators/filter";

export default class UsersController {
  /**
   * Display a list of resource
   */
  async index({logger, response, request}: HttpContext) {
    logger.info('Index method called')

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
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)

    const email = await User.findBy({email: payload.email})

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
  async show({ params, response }: HttpContext) {

    const user = await User.findOrFail(params.id)

    response.ok(user)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, response, request }: HttpContext) {
    const payload = await request.validateUsing(patchUserValidator)

    const user = await User.findOrFail(params.id)

    const patchUser = await user.merge(payload).save()

    response.ok(patchUser)
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    await user.delete()

    response.noContent()
  }
}
