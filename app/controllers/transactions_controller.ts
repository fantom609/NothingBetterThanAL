import type { HttpContext } from '@adonisjs/core/http'
import { buyTicketValidator, createTransactionValidator } from '#validators/transaction'
import { TransactionType } from "../utils/eums.js";
import {transactionIndexParams, userIndexParams} from "#validators/filter";
import User from "#models/user";
import TransactionPolicy from "#policies/transaction_policy";
import Transaction from "#models/transaction";
import Superticket from '#models/superticket'
import Session from '#models/session'

export default class TransactionsController {
  /**
   * Display a list of resource
   */
  async index({ params, logger, bouncer, request, response }: HttpContext) {
    logger.info('Index method called')

    const user = await User.findOrFail(params.user)

    if (await bouncer.with(TransactionPolicy).denies('index', user)) {
      logger.warn('User is not authorized to index a transactions')
      return response.forbidden('Cannot index a transactions')
    }

    await request.validateUsing(userIndexParams)

    const page = request.input('page', 1)
    let limit = request.input('limit', 25)
    const sort = request.input('sort', 'id')
    const order = request.input('order', 'asc')
    const filters = request.only(['type', 'balance', 'amount', 'createdAt', 'updatedAt'])

    logger.info(
      `Request parameters - page: ${page}, limit: ${limit}, sort: ${sort}, order: ${order}`
    )

    if (limit > 50) {
      logger.warn(`Limit exceeded, setting limit to 50 instead of ${limit}`)
      limit = 50
    }

    try {
      let query = Transaction.query().where('userId', user.id).orderBy(sort, order)

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

      const transactions = await query.preload('user').paginate(page, limit)

      transactions.baseUrl('/transactions')
      logger.info(`Successfully retrieved ${transactions.getMeta().total} rooms`)

      return response.status(200).json(transactions)
    } catch (error) {
      logger.error('Error retrieving users ', error)
      return response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(createTransactionValidator)

    const user = auth.user!

    if (payload.type === TransactionType.WITHDRAW) {
      if (user.balance - payload.amount < 0) {
        response
          .status(422)
          .send({
            message: 'Insufficient balance. The requested amount exceeds your available balance.',
          })
        return
      }
      user.balance -= payload.amount
    } else {
      user.balance += payload.amount
    }
    user.save()

    const transaction = await user.related('transactions').create({
      ...payload,
      balance: user.balance,
    })

    return response.status(201).send(transaction)
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Show individual history record
   */
  async indexAll({ params, logger, bouncer, request, response, auth }: HttpContext) {
    logger.info('Index method called')

    if (await bouncer.with(TransactionPolicy).denies('indexAll')) {
      logger.warn('User is not authorized to index a transactions')
      return response.forbidden('Cannot index a transactions')
    }

    await request.validateUsing(transactionIndexParams)

    const page = request.input('page', 1)
    let limit = request.input('limit', 25)
    const sort = request.input('sort', 'id')
    const order = request.input('order', 'asc')
    const filters = request.only(['type', 'balance', 'createdAt', 'updatedAt'])

    logger.info(
      `Request parameters - page: ${page}, limit: ${limit}, sort: ${sort}, order: ${order}`
    )

    if (limit > 50) {
      logger.warn(`Limit exceeded, setting limit to 50 instead of ${limit}`)
      limit = 50
    }

    try {
      let query = Transaction.query().orderBy(sort, order)

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

      const transactions = await query.preload('user').paginate(page, limit)

      transactions.baseUrl('/transactions')
      logger.info(`Successfully retrieved ${transactions.getMeta().total} rooms`)

      return response.status(200).json(transactions)
    } catch (error) {
      logger.error('Error retrieving users ', error)
      return response.status(500).json({ error: 'Internal Server Error' })
    }
  }

  async buySuperTicket({ response, auth, bouncer, logger }: HttpContext) {
    const superTicketExist = await Superticket.query().where('userId', auth.user!.id).first()
    const user = await User.findOrFail(auth.user!.id)

    if (await bouncer.with(TransactionPolicy).denies('buySuperTicket')) {
      logger.warn(`${user.name} ${user.forname} doesn't have enough money`)
      return response.forbidden('Cannot buy a superTicket')
    }

    const transaction = await Transaction.create({
      type: TransactionType.SUPERTICKET,
      userId: auth.user!.id,
      balance: user.balance - 40,
      amount: 40,
    })

    user.balance -= 40
    await user.save()

    if (superTicketExist) {
      superTicketExist.remainingUses += 10
      await superTicketExist.save()
      return response.status(200).json(superTicketExist)
    } else {
      const superTicket = await Superticket.create({
        userId: auth.user!.id,
        remainingUses: 10,
        transactionId: transaction.id,
      })

      return response.status(201).json(superTicket)
    }
  }

  async buyTicket({ request, response, auth, bouncer, logger }: HttpContext) {
    const payload = await request.validateUsing(buyTicketValidator)

    const session = await Session.query()
      .where('id', payload.sessionId)
      .preload('movie')
      .preload('tickets')
      .firstOrFail()

    if(session.tickets.length === session.room.capacity){
      logger.warn(`Room ${session.room.name} is full`)
      return response.status(401).json({ message: 'Room is full' })
    }

    const user = await User.findOrFail(auth.user!.id)

    const isTicketExist = await Session.query()
      .whereHas('tickets', (query) => {
        query.where('user_id', auth.user!.id)
          .where('session_id', payload.sessionId)
      })
      .first()

    if( isTicketExist) {
      logger.warn(`${user.name} ${user.forname} already has a ticket for ${session.movie.name}`)
      return response.status(403).json({ message: 'Ticket already exists' })
    }

    if (payload.superTicketId) await Superticket.findOrFail(payload.superTicketId)

    if (
      (await bouncer.with(TransactionPolicy).denies('buyTicket', session)) &&
      payload.superTicketId === null
    ) {
      logger.warn(`${user.name} ${user.forname} doesn't have enough money`)
      return response.forbidden('Cannot buy a Ticket')
    }

    if (payload.superTicketId) {
      const transaction = await Transaction.create({
        type: TransactionType.TICKET,
        userId: auth.user!.id,
        amount: 0,
        balance: user.balance,
      })

      const superTicket = await Superticket.query()
        .where('id', payload.superTicketId)
        .where('user_id', auth.user!.id)
        .firstOrFail()

      superTicket.remainingUses -= 1

      await superTicket.save()

      await user.related('tickets').attach({
        [session.id]: {
          transaction_id: transaction.id,
          superticket_id: payload.superTicketId,
        },
      })
    } else {
      const transaction = await Transaction.create({
        type: TransactionType.TICKET,
        userId: auth.user!.id,
        amount: session.price,
        balance: user.balance - session.price,
      })

      user.balance -= session.price
      await user.save()

      await user.related('tickets').attach({
        [session.id]: {
          transaction_id: transaction.id,
          superticket_id: payload.superTicketId ? payload.superTicketId : null,
        },
      })
    }

    const ticket = await Session.query()
      .whereHas('tickets', (query) => {
        query.where('user_id', auth.user!.id).where('session_id', payload.sessionId)
      })
      .preload('tickets')
      .first()

    return response.status(201).json(ticket)

  }
}
