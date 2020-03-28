const express = require('express')
const Service = require('./service')

class Controller {
  constructor(serviceOrModelFile) {
    this.router = express.Router()
    this.service = typeof serviceOrModelFile === 'object' ? serviceOrModelFile : new Service(serviceOrModelFile)

    setTimeout(() => this.setDefaultRoutes(), 0)
  }

  setDefaultRoutes() {
    this.router.get('/', (request, response, next) => this.service.getAll(request, response, next))

    this.router.get('/:id', (request, response, next) => this.service.getById(request, response, next))

    this.router.post('/',
                    (request, response, next) => this.service.validator(request, response, next),
                    (request, response, next) => this.service.create(request, response, next))

    this.router.patch('/:id',
                      (request, response, next) => this.service.validator(request, response, next),
                      (request, response, next) => this.service.update(request, response, next))

    this.router.delete('/:id', (request, response, next) => this.service.delete(request, response, next))
  }
}

module.exports = Controller
