class ErrorHandler {
  constructor() {
    this.middleware = (error, request, response, next) => {
      const status = error.status || 500;
      const message = error.message || HttpStatus.getStatusText(status)

      if (status === 500) {
        console.error(message)
      }

      response.status(status).send(message)
    }
  }
}

module.exports = new ErrorHandler().middleware
