const express = require('express')
const userService = require('../services/user')

class UserController {
  constructor() {
    this.router = express.Router()

    this.router.get('/',
                    (request, response, next) => userService.getAll(request, response, next))

    this.router.post('/sign-up',
                    (request, response, next) => userService.validator(request, response, next),
                    (request, response, next) => userService.signUp(request, response, next))

    this.router.get('/sign-up/resend/:email',
                    (request, response, next) => userService.resendEmail(request, response, next))

    this.router.get('/sign-up/:token/swagger',
                    (request, response, next) => userService.signUpConfirm(request, response, next, true))

    this.router.get('/sign-up/:token',
                    (request, response, next) => userService.signUpConfirm(request, response, next))

    this.router.post('/sign-in',
                    (request, response, next) => userService.validator(request, response, next, 'signIn'),
                    (request, response, next) => userService.signIn(request, response, next))

    this.router.post('/token',
                    (request, response, next) => userService.tokenRefresh(request, response, next))

    this.router.get('/password-reset/:email',
                    (request, response, next) => userService.requestPasswordChange(request, response, next))

    this.router.post('/password',
                    (request, response, next) => userService.validator(request, response, next, 'passwordChange'),
                    (request, response, next) => userService.passwordChange(request, response, next))

    this.router.get('/current',
                    (request, response, next) => userService.getUser(request, response, next))

    this.router.patch('/current',
                      (request, response, next) => userService.validator(request, response, next, 'updateUser'),
                      (request, response, next) => userService.updateUser(request, response, next))
  }
}

module.exports = new UserController()
