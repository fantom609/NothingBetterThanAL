import type { HttpContext } from '@adonisjs/core/http'
import { createMovieValidator, editMovieValidator } from '#validators/movie'
import Movie from '#models/movie'

export default class MoviesController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createMovieValidator)
    const movie = await Movie.firstOrCreate({
      name: payload.name,
      duration: payload.duration,
    })

    return response.status(201).send(movie)
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const movie = await Movie.findOrFail(params.id)
    return response.status(200).send(movie)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response }: HttpContext) {
    const movie = await Movie.findOrFail(params.id)
    const payload = await request.validateUsing(editMovieValidator)

    movie.name = payload.name ? payload.name : movie.name
    movie.duration = payload.duration ? payload.duration : movie.duration

    await movie.save()

    return response.status(200).send(movie)
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const movie = await Movie.findOrFail(params.id)
    await movie.delete()

    return response.status(204).send({ "message": "Successfully deleted" })
  }
}
