// import type { HttpContext } from '@adonisjs/core/http'

import type {HttpContext} from "@adonisjs/core/http";
import User from "#models/user";
import {loginValidator} from "#validators/user";

export default class AuthController {

  /**
   * @login
   * @requestBody {"email": "JohnDoe@gmail.com", "password": "JohnDoe20"}
   * @responseBody 200 - {"message": "string", "data": { "user": "<User>", "access_token": "string" }} - Successful login
   * @responseBody 400 - {"message": "string"} - Invalid credentials
   * @responseBody 422 - {"message": "string"} - Validation error
   * @responseBody 500 - {"message": "string"} - Internal server error
   */
  async login({request }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(payload.email, payload.password);
    const token = await User.accessTokens.create(user)

    return {
      type: 'bearer',
      value: token.value!.release(),
    }
  }

  /**
   * @logout
   * @responseBody 200 - Successful logout
   * @responseBody 400 - {"message": "string"} - Invalid credentials
   * @responseBody 500 - {"message": "string"} - Internal server error
   */
  async logout({ auth }: HttpContext) {

    const user = auth.user!
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return { message: 'User logged out' }
  }
}
