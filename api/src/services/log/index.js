const LogError = require('./log-error')

class Log {
  static create(request, response, error = null, status = 500, message = null) {
    return new LogError(request, response, error, status, message)
  }

  static send(request, response, next, error = null, status = 500, message = null) {
    const log = Log.create(request, response, error, status, message)

    next(log)
  }
}

module.exports = Log
