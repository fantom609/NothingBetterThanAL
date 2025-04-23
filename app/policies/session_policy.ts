import User from '#models/user'
import Session from '#models/session'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { UserRoles } from '../utils/eums.js'

export default class SessionPolicy extends BasePolicy {
  store(user: User) {
    return user.role === (UserRoles.ADMIN || UserRoles.SUPERADMIN)
  }

  update(user: User) {
    return user.role === (UserRoles.ADMIN || UserRoles.SUPERADMIN)
  }

  destroy(user: User) {
    return user.role === (UserRoles.ADMIN || UserRoles.SUPERADMIN)
  }
}
