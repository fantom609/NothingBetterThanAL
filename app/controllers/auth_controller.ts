// import type { HttpContext } from '@adonisjs/core/http'

import type {HttpContext} from "@adonisjs/core/http";
import User from "#models/user";
import {loginValidator} from "#validators/user";

export default class AuthController {

  async login({request }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(payload.email, payload.password);
    const token = await User.accessTokens.create(user)

    return {
      type: 'bearer',
      value: token.value!.release(),
    }
  }

  async logout({ auth }: HttpContext) {

    const user = auth.user!
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return { message: 'User logged out' }
  }
}
