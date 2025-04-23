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

  destroy(userAuthenticated: User, userDeleted: User): AuthorizerResponse {
    return (
      userAuthenticated.id === userDeleted.id || userAuthenticated.role === UserRoles.SUPERADMIN || userAuthenticated.role === UserRoles.ADMIN
    )
  }
}
