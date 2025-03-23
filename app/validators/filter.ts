import vine from '@vinejs/vine'

export const movieIndexParams = vine.compile(
  vine.object({
    page: vine.number(),
    limit: vine.number(),
    sort: vine.enum([
      'id',
      'name',
      'duration',
      'createdAt',
      'updatedAt',
    ]),
    order: vine.enum(['asc', 'desc']),
  })
)

export const roomIndexParams = vine.compile(
  vine.object({
    page: vine.number(),
    limit: vine.number(),
    sort: vine.enum([
      'id',
      'name',
      'duration',
      'type',
      'disabled',
      'maintenance',
      'createdAt',
      'updatedAt',
    ]),
    order: vine.enum(['asc', 'desc']),
  })
)

export const sessionIndexParams = vine.compile(
  vine.object({
    page: vine.number(),
    limit: vine.number(),
    sort: vine.enum([
      'id',
      'roomId',
      'movieId',
      'start',
      'end',
      'price',
      'createdAt',
      'updatedAt',
    ]),
    order: vine.enum(['asc', 'desc']),
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
