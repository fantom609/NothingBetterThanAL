import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import {UserRoles} from "../utils/eums.js";

export default class UserPolicy extends BasePolicy {

  index(user: User): AuthorizerResponse {
    return user.role === ( UserRoles.ADMIN || UserRoles.SUPERADMIN )
  }

  show(user: User): AuthorizerResponse {
    return user.role === ( UserRoles.ADMIN || UserRoles.SUPERADMIN )
  }
}
