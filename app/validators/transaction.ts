import vine from '@vinejs/vine'

export const createTransactionValidator = vine.compile(
  vine.object({
    type: vine.enum(['WITHDRAW', 'DEPOSIT']),
    amount: vine.number().positive().min(1),
  })
)

export const buyTicketValidator = vine.compile(
  vine.object({
    sessionId: vine.string().uuid(),
    superTicketId: vine.string().uuid().optional(),
  })
)
