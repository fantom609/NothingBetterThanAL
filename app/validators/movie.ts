import vine from '@vinejs/vine'

export const createMovieValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    duration: vine.number().min(0).max(500),
  })
)

export const editMovieValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255).optional(),
    duration: vine.number().min(0).max(500).optional(),
  })
)
