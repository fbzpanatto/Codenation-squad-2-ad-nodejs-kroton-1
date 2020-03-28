const Log = require('./log')
const Service = require('../utils/service')
const Config = require('../config')
const models = require('../models')
const Mailer = require('./mailer')
const Auth = require('./auth')

class UserService extends Service {
  signUp(request, response, next) {
    try {
      Auth.createToken(request.body.email)
        .then(token => {
          const password = Auth.bcrypt.hashSync(request.body.password)

          this.model
            .create({ ...request.body, token, password })
            .then(user => {
              response.status(201).json({ id: user.id, token })

              if (Config.isDefaultEnvironment || Config.isTestCoverage) {
                const confirmUrl = Config.serverHost + '/' + Config.settings.version + '/' + this.model.name + '/sign-up/' + token

                Mailer
                  .send(user.email,
                        'Log Central - Seja bem-vindo',
                        `<h1>Olá, ${ user.name }!</h1><br>Para confirmar seu cadastro, <a href="${ confirmUrl }">clique aqui</a></br>`)
                  .catch(error => console.error(error))
              }
            })
            .catch(error => Log.send(request, response, next, error))
        })
        .catch(error => Log.send(request, response, next, error))
    } catch (error) {
      Log.send(request, response, next, error)
    }
  }

  resendEmail(request, response, next) {
    this.model
      .scope('resendEmail')
      .findOne({ where: { email: request.params.email, active: false } })
      .then(user => {
        if (user) {
          const confirmUrl = Config.serverHost +'/' + Config.settings.version + '/' + this.model.name + '/sign-up/' + user.token

          if (Config.isDefaultEnvironment || Config.isTestCoverage) {
            Mailer
              .send(user.email,
                    'Log Central - Seja bem-vindo',
                    `<h1>Olá, ${ user.name }!</h1><br>Para confirmar seu cadastro, <a href="${ confirmUrl }">clique aqui</a></br>`)
              .catch(error => console.error(error))
          }

          response.status(204).send()
        } else {
          Log.send(request, response, next, null, 404)
        }
      })
      .catch(error => Log.send(request, response, next, error))
  }

  signUpConfirm(request, response, next, swagger) {
    models.Config
      .findById('loginUrl')
      .then(config => {
        this.model
          .findOne({ where: { token: request.params.token, active: false } })
          .then(user => {
            if (user) {
              const loginUrl = config.value + user.email

              this.model
                .updateById(user.id, { active: true })
                .then(() => {
                  if (swagger) {
                    response.status(200).send('Swagger only response')
                  } else {
                    response.status(302).redirect(loginUrl)
                  }
                })
                .catch(error => Log.send(request, response, next, error))
            } else {
              Log.send(request, response, next, null, 404)
            }
          })
          .catch(error => Log.send(request, response, next, error))
      })
      .catch(error => Log.send(request, response, next, error))
  }

  signIn(request, response, next) {
    this.model
      .scope('signIn')
      .findOne({ where: { email: request.body.email, active: true } })
      .then(user => {
        if (user && Auth.bcrypt.compareSync(request.body.password, user.password)) {
          Auth.createToken(request.body.email)
            .then(newToken => {
              response.status(200).json({
                name: user.name,
                token: newToken
              })
            })
            .catch(error => Log.send(request, response, next, error, 401))
        } else {
          Log.send(request, response, next, null, 401)
        }
      })
      .catch(error => Log.send(request, response, next, error))
  }

  tokenRefresh(request, response, next) {
    this.model
      .findOne({ where: { token: Auth.getToken(request), active: true } })
      .then(user => {
        if (user) {
          Auth.createToken(user.email)
            .then(newToken => {
              this.model.updateById(user.id, { token: newToken })
                .then(() => response.status(200).json(newToken))
                .catch(error => Log.send(request, response, next, error))
            })
            .catch(error => Log.send(request, response, next, error))
        } else {
          Log.send(request, response, next, null, 401)
        }
      })
      .catch(error => Log.send(request, response, next, error))
  }

  requestPasswordChange(request, response, next) {
    try {
      this.model
        .scope('passwordChange')
        .findOne({ where: { email: request.params.email, active: true } })
        .then(user => {
          if (user) {
            models.Config
              .findById('passwordUrl')
              .then(config => {
                const passwordUrl = config.value + user.token

                if (Config.isDefaultEnvironment || Config.isTestCoverage) {
                  Mailer
                    .send(user.email,
                          'Log Central - Alterar sua senha',
                          `<h1>Olá, ${ user.name }!</h1><br>Para alterar sua senha, <a href="${ passwordUrl }">clique aqui</a></br>`)
                    .then(() => response.status(204).send())
                    .catch(error => Log.send(request, response, next, error))
                } else {
                  response.status(204).send()
                }
              })
              .catch(error => Log.send(request, response, next, error))
          } else {
            Log.send(request, response, next, null, 404)
          }
        })
        .catch(error => Log.send(request, response, next, error))
    } catch (error) {
      Log.send(request, response, next, error)
    }
  }

  passwordChange(request, response, next) {
    this.model
      .findOne({ where: { token: Auth.getToken(request), active: true } })
      .then(user => {
        if (user) {
          const password = Auth.bcrypt.hashSync(request.body.password)

          this.model
            .updateById(user.id, { password })
            .then(() => response.status(204).send())
            .catch(error => Log.send(request, response, next, error))
        } else {
          Log.send(request, response, next, null, 401)
        }
      })
      .catch(error => Log.send(request, response, next, error))
  }

  getUser(request, response, next) {
    this.model
      .findOne({ where: { token: Auth.getToken(request) } })
      .then(user => {
        if (user) {
          response.status(200).json(user)
        } else {
          Log.send(request, response, next, null, 401)
        }
      })
      .catch(error => Log.send(request, response, next, error))
  }

  updateUser(request, response, next) {
    this.model
      .scope('updateUser')
      .findOne({ where: { token: Auth.getToken(request) } })
      .then(user => {
        if (user) {
          this.model
            .updateById(user.id, { ...request.body })
            .then(() => response.status(204).send())
            .catch(error => Log.send(request, response, next, error))
        } else {
          Log.send(request, response, next, null, 401)
        }
      })
      .catch(error => Log.send(request, response, next, error))
  }
}

module.exports = new UserService('user')
