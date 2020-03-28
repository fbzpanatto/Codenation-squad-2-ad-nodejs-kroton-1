const Config = require('../config')
const Log = require('../services/log')
const User = require('../models/user')
const Auth = require('../services/auth')

class AuthHandler {
  constructor() {
    this.middleware = (request, response, next) => {
      try {
        if (Config.settings.auth.exceptions.map(ex => ex.url).includes(request.url) ||
            Config.settings.auth.exceptions.findIndex(ex => ex.children && request.url.startsWith(ex.url)) !== -1) {
          next()
        } else {
          const token = Auth.getToken(request)

          if (token) {
            Auth.verifyToken(token)
              .catch(error => Log.send(request, response, next, error, 401))
              .finally(() => {
                User
                  .findOne({ where : { token, active: true }, attributes: [ 'id' ] })
                  .then(user => {
                    if (user) {
                      request.locals = {
                        ...request.locals,
                        user
                      }

                      next()
                    } else {
                      Log.send(request, response, next, null, 401)
                    }
                  })
                  .catch(error => Log.send(request, response, next, error, 401))
              })
          } else {
            throw 'Token not provided'
          }
        }
      } catch (error) {
        Log.send(request, response, next, error, 401)
      }
    }
  }
}

module.exports = new AuthHandler().middleware
