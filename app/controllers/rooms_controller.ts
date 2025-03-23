import type { HttpContext } from '@adonisjs/core/http'
import { roomIndexParams } from '#validators/filter'
import Room from '#models/room'
import {createRoomValidator, editRoomValidator, showPlanningValidator} from '#validators/room'
import RoomPolicy from "#policies/room_policy";
import {UserRoles} from "../utils/eums.js";
import Session from "#models/session";

export default class RoomsController {
  /**
   * Display a list of resource
   */
  async index({ request, logger, response, auth }: HttpContext) {
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

      if (auth.user!.role === UserRoles.USER) {
        query = query.where('maintenance', false)
        logger.info('User role is USER, filtering out maintenance rooms')
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
  async store({ request, response, bouncer, logger }: HttpContext) {
    logger.info('Store method called')

    if (await bouncer.with(RoomPolicy).denies('create')) {
      logger.warn('User is not authorized to create a room')
      return response.forbidden('Cannot create a room')
    }

    const payload = await request.validateUsing(createRoomValidator)
    logger.info('Payload validated successfully', payload)

    const room = await Room.firstOrCreate({
      ...payload,
      description: payload.description ? payload.description : null,
      maintenance: false,
    })

    logger.info(`Room created successfully with ID: ${room.id}`)
    return response.status(201).send(room)
  }
  /**
   * Show individual record
   */
  async show({ params, response, logger }: HttpContext) {
    logger.info(`Show method called for room ID: ${params.id}`)

    const room = await Room.findOrFail(params.id)
    await room.load('sessions')
    logger.info(`Room with ID ${params.id} retrieved successfully`)

    return response.status(200).send(room)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, bouncer, logger }: HttpContext) {
    logger.info(`Update method called for room ID: ${params.id}`)

    if (await bouncer.with(RoomPolicy).denies('update')) {
      logger.warn('User is not authorized to update the room')
      return response.forbidden('Cannot update the room')
    }

    const room = await Room.findOrFail(params.id)
    const payload = await request.validateUsing(editRoomValidator)
    logger.info('Payload validated successfully', payload)

    room.name = payload.name ? payload.name : room.name
    room.description = payload.description ? payload.description : room.description
    room.type = payload.type ? payload.type : room.type
    room.disabled = payload.disabled ? payload.disabled : room.disabled
    room.maintenance = payload.maintenance === undefined ? room.maintenance : payload.maintenance
    room.capacity = payload.capacity ? payload.capacity : room.capacity

    await room.save()
    logger.info(`Room with ID ${params.id} updated successfully`)

    return response.status(200).send(room)
  }

  /**
   * Delete record
   */
  async destroy({ params, response, bouncer, logger }: HttpContext) {
    logger.info(`Destroy method called for room ID: ${params.id}`)

    if (await bouncer.with(RoomPolicy).denies('destroy')) {
      logger.warn('User is not authorized to delete the room')
      return response.forbidden('Cannot delete the room')
    }

    const room = await Room.findOrFail(params.id)
    await room.delete()
    logger.info(`Room with ID ${params.id} deleted successfully`)

    return response.status(204).send({ message: 'Successfully deleted' })
  }

  async showPlanning({ params, response, request, logger }: HttpContext) {
    logger.info(`ShowPlanning method called for room ID: ${params.id}`)

    await request.validateUsing(showPlanningValidator)

    const startDate = request.input('startDate')
    const endDate = request.input('endDate')
    const page = request.input('page', 1)
    let limit = request.input('limit', 25)

    if (limit > 50) {
      logger.warn(`Limit exceeded, setting limit to 50 instead of ${limit}`)
      limit = 50
    }

    const sessions = await Session.query()
      .where('roomId', params.id)
      .where('start', '>=', startDate)
      .where('start', '<=', endDate)
      .paginate(page, limit)

    logger.info(`Successfully retrieved ${sessions.getMeta().total} sessions for room ID ${params.id}`)
    return response.status(200).send(sessions)
  }
}
