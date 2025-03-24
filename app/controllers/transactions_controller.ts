import type { HttpContext } from '@adonisjs/core/http'
import {createTransactionValidator} from "#validators/transaction";
import { TransactionType } from "../utils/eums.js";
import {transactionIndexParams, userIndexParams} from "#validators/filter";
import User from "#models/user";
import TransactionPolicy from "#policies/transaction_policy";
import Transaction from "#models/transaction";
import Superticket from '#models/superticket'

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
    const filters = request.only(['type', 'balance', 'createdAt', 'updatedAt'])

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
  async store({ request, logger, auth, response }: HttpContext) {
    const payload = await request.validateUsing(createTransactionValidator)

    const user = auth.user!

    if (payload.type === TransactionType.WITHDRAW) {
      if (user.balance - payload.balance < 0) {
        response
          .status(422)
          .send({
            message: 'Insufficient balance. The requested amount exceeds your available balance.',
          })
        return
      }
      user.balance -= payload.balance
    } else {
      user.balance += payload.balance
    }
    user.save()

    const transaction = await user.related('transactions').create({
      ...payload,
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
}
