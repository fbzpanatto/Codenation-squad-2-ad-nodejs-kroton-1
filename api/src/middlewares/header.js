class HeaderHandler {
  constructor() {
    this.middleware = (request, response, next) => {
      response.setHeader('X-Powered-By', 'LogCentral')

      next()
    }
  }
}

module.exports = new HeaderHandler().middleware
