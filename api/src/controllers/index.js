const fs = require('fs')
const path = require('path')
const express = require('express')
const router = express.Router()

const Config = require('../config')
const Controller = require('../utils/controller')

const endpoints = {}

fs.readdirSync(path.resolve('./api/src/controllers'))
  .filter(routeFile => routeFile.endsWith('.js') && routeFile !== 'index.js')
  .forEach(routeFile => {
    const route = require(path.resolve('./api/src/controllers', routeFile)).router

    if (typeof route === 'function') {
      if (fs.existsSync(path.resolve('./api/src/models', routeFile))) {
        const model = require(path.resolve('./api/src/models', routeFile))

        if (typeof model === 'function' && !Object.keys(endpoints).map(key => key.toLowerCase()).includes(model.name.toLowerCase())) {
          endpoints[model.name] = Config.basePath + model.name
          router.use('/' + model.name, route)
        }
      } else {
        let routeName = routeFile.substr(0, routeFile.length - 3)
        routeName = routeName.substr(0, 1).toUpperCase() + routeName.substr(1)

        if (!Object.keys(endpoints).map(key => key.toLowerCase()).includes(routeName.toLowerCase())) {
          endpoints[routeName] = Config.basePath + routeName
          router.use('/' + routeName, route)
        }
      }
    }
})

fs.readdirSync(path.resolve('./api/src/models'))
  .filter(modelFile => modelFile !== 'index.js')
  .forEach(modelFile => {
    const model = require(path.resolve('./api/src/models', modelFile))

    if (!fs.existsSync(path.resolve('./api/src/controllers', modelFile))) {
      const route = new Controller(modelFile).router

      if (!Object.keys(endpoints).map(key => key.toLowerCase()).includes(model.name.toLowerCase())) {
        router.use('/' + model.name, route)
      }
    }
})

module.exports = router
