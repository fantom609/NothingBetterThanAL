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
  async store({}: HttpContext) {}


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
