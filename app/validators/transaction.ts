import vine from '@vinejs/vine'

export const createTransactionValidator = vine.compile(
  vine.object({
    type: vine.enum(['WITHDRAW', 'DEPOSIT']),
    balance: vine.number().positive().min(1),
  })
)
