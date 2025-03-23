import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    forname: vine.string().trim(),
    name: vine.string().trim(),
    email: vine.string().email(),
    password: vine.string().trim().minLength(8).maxLength(20),
  })
)

export const patchUserValidator = vine.compile(
  vine.object({
    forname: vine.string().trim().optional(),
    name: vine.string().trim().optional(),
    email: vine.string().email().optional(),
    role: vine.enum(['USER', 'ADMIN', 'SUPERADMIN']).optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().trim().minLength(8).maxLength(20),
  })
)
