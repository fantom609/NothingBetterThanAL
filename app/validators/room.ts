import vine from '@vinejs/vine'

export const createRoomValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().minLength(3).maxLength(1024).optional(),
    type: vine.enum(['2D', '3D', '4D']),
    disabled: vine.boolean(),
    capacity: vine.number().positive().withoutDecimals().min(15).max(30),
  })
)

export const editRoomValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().minLength(3).maxLength(1024).optional(),
    type: vine.enum(['2D', '3D', '4D']).optional(),
    disabled: vine.boolean().optional(),
    maintenance: vine.boolean().optional(),
    capacity: vine.number().positive().withoutDecimals().min(15).max(30).optional(),
  })
)
