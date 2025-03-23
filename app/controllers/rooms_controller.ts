import type { HttpContext } from '@adonisjs/core/http'
import { roomIndexParams } from '#validators/filter'
import Room from '#models/room'
import { createRoomValidator, editRoomValidator } from '#validators/room'

export default class RoomsController {
  /**
   * Display a list of resource
   */
  async index({ request, logger, response}: HttpContext) {
    logger.info('Index method called')

    await request.validateUsing(roomIndexParams)

    const page = request.input('page', 1)
    let limit = request.input('limit', 25)
    const sort = request.input('sort', 'id')
    const order = request.input('order', 'asc')
    const filters = request.only([
      'id',
      'name',
      'duration',
      'type',
      'disabled',
      'maintenance',
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
      let query = Room.query().orderBy(sort, order)

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

      const room = await query.paginate(page, limit)

      room.baseUrl('/rooms')
      logger.info(`Successfully retrieved ${room.getMeta().total} rooms`)

      return response.status(200).json(room)
    } catch (error) {
      logger.error('Error retrieving rooms ', error)
      return response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createRoomValidator)
    const room = await Room.firstOrCreate({
      name: payload.name,
      description: payload.description ? payload.description : null,
      type: payload.type,
      disabled: payload.disabled,
      maintenance: false,
    })

    return response.status(201).send(room)
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const room = await Room.findOrFail(params.id)
    return response.status(200).send(room)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response }: HttpContext) {
    const room = await Room.findOrFail(params.id)
    const payload = await request.validateUsing(editRoomValidator)

    room.name = payload.name ? payload.name : room.name
    room.description = payload.description ? payload.description : room.description
    room.type = payload.type ? payload.type : room.type
    room.disabled = payload.disabled ? payload.disabled : room.disabled
    room.maintenance = payload.maintenance === undefined ? room.maintenance : payload.maintenance

    await room.save()

    return response.status(200).send(room)
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const room = await Room.findOrFail(params.id)
    await room.delete()

    return response.status(204).send({ message: 'Successfully deleted' })
  }
}
