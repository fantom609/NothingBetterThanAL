import vine from '@vinejs/vine'

const iso8601DateValidator = vine
  .string()
  .regex(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)$/)

export const createSessionValidator = vine.compile(
  vine.object({
    roomId: vine.string().trim().uuid(),
    movieId: vine.string().trim().uuid(),
    start: iso8601DateValidator,
    price: vine.number().positive(),
  })
)

export const editSessionValidator = vine.compile(
  vine.object({
    roomId: vine.string().trim().uuid().optional(),
    movieId: vine.string().trim().uuid().optional(),
    start: iso8601DateValidator.optional(),
    price: vine.number().positive().optional(),
  })
)
