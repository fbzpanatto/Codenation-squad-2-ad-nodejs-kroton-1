const HttpStatus = require('http-status-codes')

class LogError extends Error {
  constructor(request, response, error = null, status = 500, message = null) {
    super()

    if (typeof status === 'string') {
      message = status
      status = 500
    }

    if (typeof error === 'number' && error >= 300 && error <= 599) {
      status = error
      error = null
    }

    if (error) {
      switch (error.name) {
        case 'SequelizeDatabaseError':
        case 'SequelizeUniqueConstraintError':
        case 'LogCentralValidatorError':
          if (error.original && error.original.code) {
            switch (error.original.code) {
              case 'ER_NO_REFERENCED_ROW':
                status = 400
                break

              case 'ER_DUP_ENTRY':
                status = 409
                break
            }
          }

          break

        case 'SequelizeValidationError':
          status = 400

          break
      }

      if (!message && error.original && error.original.sqlMessage) {
        message = error.original.sqlMessage
      }

      if (!message && error.parent && error.parent.sqlMessage) {
        message = error.parent.sqlMessage
      }
    }

    this.status = status
    this.message = message || HttpStatus.getStatusText(status)
    this.request = request
    this.response = response
  }
}

module.exports = LogError
