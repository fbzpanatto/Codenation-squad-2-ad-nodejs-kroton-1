const express = require('express')
const settings = require('../../../config/settings')
const middlewares = require('../middlewares')

const expressServer = express()

class FrontSample {
  constructor() {
    expressServer.use(middlewares.Cors)

    expressServer.use(middlewares.Compression)

    expressServer.use(middlewares.JsonBodyParser)

    expressServer.use(middlewares.Header)
  }

  start() {
    return new Promise((resolve, reject) => {
      try {
        expressServer.use('/password-change/:token', (request, response) => {
          response.status(200).send('<center><img src="http://api.logcentral.azul.dev/Swagger/files/shots/1-cadastro.png" style="width: 800px;" alt=""><br>Alteração de senha para o token ' + request.params.token + '.</center>')
        })

        expressServer.use('/login/:email', (request, response) => {
          response.status(200).send('<center><img src="http://api.logcentral.azul.dev/Swagger/files/shots/2-login.png" style="width: 800px;" alt=""><br>Login utilizando o e-mail ' + request.params.email + '.</center>')
        })

        expressServer.use('/', (request, response) => {
          response.status(200).send('Front-end sample')
        })

        this.server = expressServer.listen(settings.gui.port, () => {
          console.info('Client listening at %s://%s:%s/', settings.gui.protocol, settings.gui.host, settings.gui.port)

          resolve(this.server)
        })
      } catch (error) {
        reject(error)
      }
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

module.exports = new FrontSample()
