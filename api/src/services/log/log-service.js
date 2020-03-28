const Log = require('.')
const Service = require('../../utils/service')
const models = require('../../models')
const Config = require('../../config')

const include = [
  { model: models.Application, as: 'application', attributes:[ 'id', 'name' ] },
  { model: models.Method, as: 'method', attributes:[ 'id', 'label' ] },
  { model: models.Level, as: 'level', attributes:[ 'id', 'label' ] },
  { model: models.User, as: 'user', attributes:[ 'id', 'name', 'email' ] },
  { model: models.Environment, as: 'environment', attributes:[ 'id', 'label' ] }
]

class LogService extends Service {
  archive(request, response, next) {
    this.model
      .updateById(request.params.id, { archived: true })
      .then(data => {
        if (data[0] > 0) {
          response.status(204).send()
        } else {
          Log.send(request, response, next, null, 404)
        }
      })
      .catch(error => Log.send(request, response, next, error, 404))
  }

  create(request, response, next) {
    models.User
      .findOne({ where: { token: request.headers[Config.settings.auth.key] }, attributes: [ 'id' ] })
      .then(user => {
        if (user) {
          request.body.user = { id: user.id }

          super.create(request, response, next)
        } else {
          Log.send(request, response, next, null, 401)
        }
      })
      .catch(error => Log.send(request, response, next, error))
  }
}

module.exports = new LogService('log', undefined, include)
