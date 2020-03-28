const express = require('express')
const path = require('path')
const sequelize = require('../utils/sequelize')
const Config = require('../config')
const middlewares = require('../middlewares')
const controllers = require('../controllers')

const expressServer = express()

class Server {
  constructor() {
    expressServer.use(middlewares.Cors)

    expressServer.use(middlewares.Compression)

    expressServer.use(middlewares.JsonBodyParser)

    expressServer.use(middlewares.Header)

    expressServer.use(middlewares.AuthHandler)

    expressServer.use('/' + Config.settings.version, controllers)

    expressServer.use(middlewares.ErrorHandler)
  }

  init(testMode) {
    return new Promise((resolve, reject) => {
      try {
        const data = require('../../test/data')

        sequelize
          .sync({ force: testMode })
          .then(() => {
            Object.values(sequelize.models)
              .filter(model => Object.keys(data).filter(key => data[key].default).includes(model.name))
              .forEach(model => {
                if (data[model.name].initial) {
                  data[model.name].initial.forEach(async entry => {
                    await model.findOrCreate({ where: entry })
                      .catch(error => reject(error))
                  })

                  resolve()
                }
              })
          })
          .catch(error => reject(error))
      } catch (error) {
        reject(error)
      }
    })
  }

  start(testMode = false) {
    return new Promise((resolve, reject) => {
      this.init(testMode)
        .then(() => {
          if (!testMode) {
            const swaggerUi = require('swagger-ui-express')
            const SwaggerBuild = require('./swagger')

            expressServer.use('/Swagger/files', express.static(path.resolve('./api/src/services/swagger/files')))
            expressServer.use('/Swagger', swaggerUi.serve, swaggerUi.setup(SwaggerBuild.swaggerDocument))
          }

          expressServer.use('/', (request, response) => response.status(301).redirect('/Swagger'))

          this.server = expressServer.listen(Config.settings.server.port, () => {
            if (!testMode) {
              console.info('Server listening at %s', Config.serverHost)
            }

            resolve(this.server)
          })
        })
        .catch(error => reject(error))
    })
  }

  stop() {
    return new Promise((resolve, reject) => {
      try {
        this.server.close(() => resolve())
      } catch (error) {
        reject(error)
      }
    })
  }
}

module.exports = new Server()
