import vine from '@vinejs/vine'

export const movieIndexParams = vine.compile(
  vine.object({
    page: vine.number().optional(),
    limit: vine.number().optional(),
    sort: vine.enum([
      'id',
      'name',
      'duration',
      'createdAt',
      'updatedAt',
    ]).optional(),
    order: vine.enum(['asc', 'desc']).optional(),
  })
)

export const roomIndexParams = vine.compile(
  vine.object({
    page: vine.number().optional(),
    limit: vine.number().optional(),
    sort: vine.enum([
      'id',
      'name',
      'duration',
      'type',
      'disabled',
      'maintenance',
      'createdAt',
      'updatedAt',
    ]).optional(),
    order: vine.enum(['asc', 'desc']).optional(),
  })
)

export const sessionIndexParams = vine.compile(
  vine.object({
    page: vine.number().optional(),
    limit: vine.number().optional(),
    sort: vine.enum([
      'id',
      'roomId',
      'movieId',
      'start',
      'end',
      'price',
      'createdAt',
      'updatedAt',
    ]).optional(),
    order: vine.enum(['asc', 'desc']).optional(),
  })
)

export const userIndexParams = vine.compile(
  vine.object({
    page: vine.number().optional(),
    limit: vine.number().optional(),
    sort: vine.enum([
      'id',
      'name',
      'forname',
      'email',
      'role',
      'createdAt',
      'updatedAt',
    ]).optional(),
    order: vine.enum(['asc', 'desc']).optional(),
  })
)

export const transactionIndexParams = vine.compile(
  vine.object({
    page: vine.number().optional(),
    limit: vine.number().optional(),
    sort: vine.enum([
      'amount',
      'balance',
      'type',
      'createdAt',
      'updatedAt',
    ]).optional(),
    order: vine.enum(['asc', 'desc']).optional(),
  })
)


export const statisticsIndexParams = vine.compile(
  vine.object({
    page: vine.number().positive().withoutDecimals().min(1).optional(),
    limit: vine.number().positive().withoutDecimals().min(1).max(50).optional(),
    start_date: vine.date().optional(),
    end_date: vine.date().afterField('start_date').optional(),
  })
)

export const realTimeStatistics = vine.compile(
  vine.object({
    start: vine.string().trim().optional(),
    end: vine.string().trim().optional(),
  })
)
