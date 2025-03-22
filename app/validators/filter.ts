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
