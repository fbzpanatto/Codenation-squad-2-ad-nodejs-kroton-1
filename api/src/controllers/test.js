const express = require('express')
const Log = require('../services/log')

class TestController {
  constructor() {
    this.router = express.Router()

    this.router.get('/ping', (request, response) => response.status(200).send('ping'))

    this.router.get('/error', (request, response, next) => Log.send(request, response, next))
  }
}

module.exports = new TestController()
