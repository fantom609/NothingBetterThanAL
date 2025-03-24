// import type { HttpContext } from '@adonisjs/core/http'

import type { HttpContext } from '@adonisjs/core/http'
import Superticket from '#models/superticket'


export default class SuperticketsController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ response, auth }: HttpContext) {
    const superTicketExist = await Superticket.query().where('userId', auth.user!.id).first()
    if(superTicketExist) {
      superTicketExist.remainingUses += 10
      superTicketExist.save()
      return response.status(200).json(superTicketExist)
    }else{
      const superTicket = superTicket.create({
        userId: auth.user!.id,
        remainingUses: 10
      })
    }
  }


  /**
   * Show individual record
   */
  async show({}: HttpContext) {
  }

  /**
   * Handle form submission for the edit action
   */
  async update({}: HttpContext) {
  }

  /**
   * Delete record
   */
  async destroy({}: HttpContext) {}

}
