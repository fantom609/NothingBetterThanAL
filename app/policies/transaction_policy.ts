import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import {UserRoles} from "../utils/eums.js";

export default class TransactionPolicy extends BasePolicy {

  index(user: User, user2: User): AuthorizerResponse {
    return user.role === ( UserRoles.ADMIN || UserRoles.SUPERADMIN ) || user.id === user2.id
  }

  indexAll(user: User): AuthorizerResponse {
    return user.role === ( UserRoles.ADMIN || UserRoles.SUPERADMIN )
  }

  destroy(user: User): AuthorizerResponse {
    return user.role === ( UserRoles.ADMIN || UserRoles.SUPERADMIN )
  }

  buySuperTicket(user: User): AuthorizerResponse {
    return user.balance >= 40
  }
}
