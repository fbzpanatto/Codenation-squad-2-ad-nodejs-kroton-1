const Controller = require('../utils/controller')
const LogService = require('../services/log/log-service')

class LogController extends Controller {
  constructor() {
    super(LogService)

    this.router.put('/:id/archive',
                    (request, response, next) => this.service.validator(request, response, next),
                    (request, response, next) => this.service.archive(request, response, next))

    this.service.update = this.service.notAllowed
  }
}

module.exports = new LogController()
