import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { UserRoles } from '../utils/eums.js'

export default class MoviePolicy extends BasePolicy {
  index(user: User): AuthorizerResponse {
    return user.role === ( UserRoles.ADMIN || UserRoles.SUPERADMIN )
  }

  show(user: User): AuthorizerResponse {
    return user.role === ( UserRoles.ADMIN || UserRoles.SUPERADMIN )
  }

  store(user: User): AuthorizerResponse {
    return user.role === ( UserRoles.ADMIN || UserRoles.SUPERADMIN )
  }

  update(user: User): AuthorizerResponse {
    return user.role === ( UserRoles.ADMIN || UserRoles.SUPERADMIN )
  }

  destroy(user: User): AuthorizerResponse {
    return user.role === ( UserRoles.ADMIN || UserRoles.SUPERADMIN )
  }
}
