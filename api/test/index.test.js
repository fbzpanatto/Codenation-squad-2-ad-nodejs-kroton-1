const request = require('supertest')
const HttpStatus = require('http-status-codes')
const sequelize = require('../src/utils/sequelize')
const Config = require('../src/config')
const Server = require('../src/services/server')

const Data = require('./data')
const Mock = require('./mock')

let server
let token
let newToken

beforeAll((done) => {
  Server.start(true)
    .then(newServer => {
      server = newServer

      done()
    })
    .catch(error => done(error))
})

afterAll((done) => {
  sequelize.close()
    .then(() => {
      Server.stop()
        .then(() => done())
        .catch(error => done(error))
    })
    .catch(error => done(error))
})

const testEmptyGet = (model) => {
  describe('GET /' + Config.settings.version + '/' + model.name + ' should', () => {
    test('return 401 status', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name)
        .expect(401, HttpStatus.getStatusText(401))
  
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name)
        .set(Config.settings.auth.key, 'INVALID-TOKEN')
        .expect(401, HttpStatus.getStatusText(401))
    })

    if (model !== sequelize.models.User) {
      test('return 200 status and empty array', async () => {
        await request(server)
          .get('/' + Config.settings.version + '/' + model.name)
          .set(Config.settings.auth.key, token)
          .expect('Content-Type', /json/)
          .expect(200, {
            count: Data[model.name].initial ? Data[model.name].initial.length : 0,
            data: Data[model.name].initial || []
          })
      })
    }
  })
}

const testPost = (model) => {
  describe('POST /' + Config.settings.version + '/' + model.name + ' should', () => {
    test('return 401 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name)
        .send(Data[model.name].create)
        .expect(401, HttpStatus.getStatusText(401))

      await request(server)
        .post('/' + Config.settings.version + '/' + model.name)
        .set(Config.settings.auth.key, 'INVALID-TOKEN')
        .send(Data[model.name].create)
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 400 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name)
        .set(Config.settings.auth.key, token)
        .send({ invalidField: true })
        .expect(400, HttpStatus.getStatusText(400))

      await request(server)
        .post('/' + Config.settings.version + '/' + model.name)
        .set(Config.settings.auth.key, token)
        .send({ ...Data[model.name].create, invalidField: true })
        .expect(400, HttpStatus.getStatusText(400))
    })
  
    test('return 201 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name)
        .set(Config.settings.auth.key, token)
        .send(Data[model.name].create)
        .expect(201, Data[model.name].created)
    })

    test('return 409 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name)
        .set(Config.settings.auth.key, token)
        .send(Data[model.name].create)
        .expect(409)
    })
  })
}

const testGetAll = (model) => {
  describe('GET /' + Config.settings.version + '/' + model.name + ' (after POST) should', () => {
    test('return 401 status', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name)
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 401 status', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name)
        .set({ [Config.settings.auth.key]: 'INVALID-TOKEN' })
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 200 status and ' + model.name.toLowerCase() + ' array', async (done) => {
      let initial = Data[model.name].initial || []

      request(server)
        .get('/' + Config.settings.version + '/' + model.name)
        .set(Config.settings.auth.key, token)
        .expect(200)
        .then(response => {
          expect(response.body).toMatchObject({ count: initial.length + 1,
                                                data: [ { ...Data[model.name].created,
                                                          ...Data[model.name].updated },
                                                          ...initial ] })

          done()
        })
    })
  })
}

const testNotFoundGet = (model) => {
  describe('GET /' + Config.settings.version + '/' + model.name + '/:id should', () => {
    test('return 401 status', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name)
        .expect(401, HttpStatus.getStatusText(401))
  
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name)
        .set(Config.settings.auth.key, 'INVALID-TOKEN')
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 404 status', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/0')
        .set(Config.settings.auth.key, token)
        .expect(404, HttpStatus.getStatusText(404))
    })
  })
}

const testGetOne = (model) => {
  const primaryKeyValue = Data[model.name].create.id ? Data[model.name].create.id : 1

  describe('GET /' + Config.settings.version + '/' + model.name + '/:id should', () => {
    test('return 401 status', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/' + primaryKeyValue)
        .expect(401, HttpStatus.getStatusText(401))

      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/' + primaryKeyValue)
        .set(Config.settings.auth.key, 'INVALID-TOKEN')
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 200 status and ' + model.name.toLowerCase() + ' object', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/' + primaryKeyValue)
        .set(Config.settings.auth.key, token)
        .expect(200, { ...Data[model.name].created,
                       ...Data[model.name].updated })
    })
  })
}

const testPatch = (model) => {
  const primaryKeyValue = Data[model.name].create.id ? Data[model.name].create.id : 1

  describe('PATCH /' + Config.settings.version + '/' + model.name + '/:id should', () => {
    test('return 400 status', async () => {
      await request(server)
        .patch('/' + Config.settings.version + '/' + model.name + '/' + primaryKeyValue)
        .set(Config.settings.auth.key, token)
        .send({ invalidField: true })
        .expect(400, HttpStatus.getStatusText(400))
    })

    test('return 400 status', async () => {
      await request(server)
        .patch('/' + Config.settings.version + '/' + model.name + '/' + primaryKeyValue)
        .set(Config.settings.auth.key, token)
        .send({ ...Data[model.name].create, invalidField: true })
        .expect(400, HttpStatus.getStatusText(400))
    })

    test('return 404 status', async () => {
      await request(server)
        .patch('/' + Config.settings.version + '/' + model.name + '/0')
        .set(Config.settings.auth.key, token)
        .send(Data[model.name].update)
        .expect(404, HttpStatus.getStatusText(404))
    })
  
    test('return 204 status', async () => {
      await request(server)
        .patch('/' + Config.settings.version + '/' + model.name + '/' + primaryKeyValue)
        .set(Config.settings.auth.key, token)
        .send(Data[model.name].update)
        .expect(204)
    })
  })

  describe('GET /' + Config.settings.version + '/' + model.name + '/:id should', () => {
    test('return 200 status and updated ' + model.name.toLowerCase() + ' object', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/' + primaryKeyValue)
        .set(Config.settings.auth.key, token)
        .expect(200, { ...Data[model.name].created,
                       ...Data[model.name].update,
                       ...Data[model.name].updated })
    })
  })
}

const testPatchNotAllowed = (model) => {
  const primaryKeyValue = Data[model.name].create.id ? Data[model.name].create.id : 1

  describe('PATCH /' + Config.settings.version + '/' + model.name + '/:id should', () => {
    test('return 405 status', async () => {
      await request(server)
        .patch('/' + Config.settings.version + '/' + model.name + '/' + primaryKeyValue)
        .set(Config.settings.auth.key, token)
        .expect(405, HttpStatus.getStatusText(405))
    })
  })
}

const testDelete = (model) => {
  describe('DELETE /' + Config.settings.version + '/' + model.name + '/:id should', () => {
    test('return 401 status', async () => {
      await request(server)
        .delete('/' + Config.settings.version + '/' + model.name + '/0')
        .expect(401, HttpStatus.getStatusText(401))

      await request(server)
        .delete('/' + Config.settings.version + '/' + model.name + '/0')
        .set(Config.settings.auth.key, 'INVALID-TOKEN')
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 404 status', async () => {
      await request(server)
        .delete('/' + Config.settings.version + '/' + model.name + '/0')
        .set(Config.settings.auth.key, token)
        .expect(404, HttpStatus.getStatusText(404))
    })
  
    test('return 204 status', async () => {
      const toDelete = await request(server)
        .post('/' + Config.settings.version + '/' + model.name)
        .set(Config.settings.auth.key, token)
        .send(Data[model.name].delete)
        .expect(201)

      await request(server)
        .delete('/' + Config.settings.version + '/' + model.name + '/' + toDelete.body.id)
        .set(Config.settings.auth.key, token)
        .expect(204)
    })
  })
}

const testNewUser = (model) => {
  describe('POST /' + Config.settings.version + '/' + model.name + '/sign-up should', () => {
    test('return 400 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/sign-up')
        .send({ invalidField: true })
        .expect(400, HttpStatus.getStatusText(400))

      await request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/sign-up')
        .send({ ...Data[model.name].create, invalidField: true })
        .expect(400, HttpStatus.getStatusText(400))
    })
  
    test('return 201 status', (done) => {
      request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/sign-up')
        .send(Data[model.name].create)
        .expect(201)
        .then(response => {
          expect(response.body.id).toBe(1)
          expect(typeof response.body.token).toBe('string')
          expect(response.body.token).not.toBe('')

          token = response.body.token

          done()
        })
    })

    test('return 409 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/sign-up')
        .send(Data[model.name].create)
        .expect(409)
    })
  })

  describe('GET /' + Config.settings.version + '/' + model.name + '/sign-up/resend/:email should', () => {
    test('return 404 status', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/sign-up/resend/invalid@email.com')
        .expect(404, HttpStatus.getStatusText(404))
    })

    test('return 204 status', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/sign-up/resend/' + Data[model.name].create.email)
        .expect(204)
    })
  })

  describe('GET /' + Config.settings.version + '/' + model.name + '/sign-up/:token should', () => {
    test('return 404 status', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/sign-up/NOT-FOUND-TOKEN')
        .expect(404, HttpStatus.getStatusText(404))
    })

    test('return 302 status and redirect', (done) => {
      request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/sign-up/' + token)
        .expect(302)
        .then(response => {
          sequelize.models.Config
            .findById('loginUrl')
            .then(config => {
              expect(response.redirect).toBe(true)
              expect(response.header.location).toContain(config.value)

              done()
            })
            .catch(error => done(error))
        })
    })
  })
}

const testAuthUser = (model) => {
  describe('POST /' + Config.settings.version + '/' + model.name + '/sign-in should', () => {
    test('return 400 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/sign-in')
        .expect(400, HttpStatus.getStatusText(400))
    })

    test('return 401 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/sign-in')
        .send({
          email: Data[model.name].create.email,
          password: 'INVALID-PASSWORD'
        })
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 200 status with ' + model.name.toLowerCase() + ' name and token', async (done) => {
      request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/sign-in')
        .send({
          email: Data[model.name].create.email,
          password: Data[model.name].create.password
        })
        .expect(200)
        .then(response => {
          expect(response.body.name).toEqual(Data[model.name].create.name)
          expect(response.body.token).not.toEqual('')

          done()
        })
    })
  })
}

const testNewToken = (model) => {
  describe('POST /' + Config.settings.version + '/' + model.name + '/token should', () => {
    test('return 401 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/token')
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 401 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/token')
        .set({ [Config.settings.auth.key]: 'INVALID-TOKEN' })
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 200 status with ' + model.name.toLowerCase() + ' name and token', (done) => {
      request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/token')
        .set(Config.settings.auth.key, token)
        .expect(200)
        .then(response => {
          expect(response.body).not.toEqual('')
          expect(response.body).not.toEqual(token)

          newToken = response.body

          done()
        })
      
    })
  })
}

const testRequestPasswordChange = (model) => {
  describe('GET /' + Config.settings.version + '/' + model.name + '/password-reset/:email should', () => {
    test('return 404 status', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/password-reset/invalid@email.com')
        .expect(404, HttpStatus.getStatusText(404))
    })

    test('return 204 status', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/password-reset/' + Data[model.name].create.email)
        .expect(204)
    })
  })
}

const testPasswordChange = (model) => {
  describe('POST /' + Config.settings.version + '/' + model.name + '/password should', () => {
    test('return 401 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/password')
        .set({ [Config.settings.auth.key]: 'INVALID-TOKEN' })
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 400 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/password')
        .set(Config.settings.auth.key, newToken)
        .expect(400, HttpStatus.getStatusText(400))
    })

    test('return 400 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/password')
        .set(Config.settings.auth.key, newToken)
        .send({ test: false })
        .expect(400, HttpStatus.getStatusText(400))
    })

    test('return 204 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name + '/password')
        .set(Config.settings.auth.key, newToken)
        .send({ password: 'new-password' })
        .expect(204)
    })
  })
}

const testPatchCurrentUser = (model) => {
  describe('PATCH /' + Config.settings.version + '/' + model.name + '/current should', () => {
    test('return 401 status', async () => {
      await request(server)
        .patch('/' + Config.settings.version + '/' + model.name + '/current')
        .send(Data[model.name].update)
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 401 status', async () => {
      await request(server)
        .patch('/' + Config.settings.version + '/' + model.name + '/current')
        .set({ [Config.settings.auth.key]: 'INVALID-TOKEN' })
        .send(Data[model.name].update)
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 400 status', async () => {
      await request(server)
        .patch('/' + Config.settings.version + '/' + model.name + '/current')
        .set(Config.settings.auth.key, token)
        .send({ invalidField: true })
        .expect(400, HttpStatus.getStatusText(400))
    })

    test('return 400 status', async () => {
      await request(server)
        .patch('/' + Config.settings.version + '/' + model.name + '/current')
        .set(Config.settings.auth.key, token)
        .send({ ...Data[model.name].create, invalidField: true })
        .expect(400, HttpStatus.getStatusText(400))
    })

    test('return 400 status', async () => {
      await request(server)
        .patch('/' + Config.settings.version + '/' + model.name + '/current')
        .set(Config.settings.auth.key, token)
        .send({ ...Data[model.name].update, email: 'INVALID-EMAIL' })
        .expect(400, HttpStatus.getStatusText(400))
    })
  
    test('return 204 status', async () => {
      await request(server)
        .patch('/' + Config.settings.version + '/' + model.name + '/current')
        .set(Config.settings.auth.key, token)
        .send(Data[model.name].update)
        .expect(204)
    })
  })

  describe('GET /' + Config.settings.version + '/' + model.name + '/current should', () => {
    test('return 200 status and updated ' + model.name.toLowerCase() + ' object', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/current')
        .set(Config.settings.auth.key, token)
        .expect(200, { ...Data[model.name].created,
                       ...Data[model.name].update,
                       ...Data[model.name].updated })
    })
  })
}

const testGetCurrentUser = async (model) => {
  describe('GET /' + Config.settings.version + '/' + model.name + '/current should', () => {
    test('return 401 status', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/current')
        .expect(401, HttpStatus.getStatusText(401))
  
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/current')
        .set(Config.settings.auth.key, 'INVALID-TOKEN')
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 200 status and ' + model.name + ' object', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/' + model.name + '/current')
        .set(Config.settings.auth.key, token)
        .expect(200, { ...Data[model.name].created,
                       ...Data[model.name].update,
                       ...Data[model.name].updated })
    })
  })
}

const testNewLog = (model) => {
  describe('POST /' + Config.settings.version + '/' + model.name + ' should', () => {
    test('return 401 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name)
        .send(Data[model.name].create)
        .expect(401, HttpStatus.getStatusText(401))

      await request(server)
        .post('/' + Config.settings.version + '/' + model.name)
        .set({ [Config.settings.auth.key]: 'INVALID-TOKEN' })
        .send(Data[model.name].create)
        .expect(401, HttpStatus.getStatusText(401))
    })

    test('return 400 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name)
        .set(Config.settings.auth.key, token)
        .send({ invalidField: true })
        .expect(400, HttpStatus.getStatusText(400))

      await request(server)
        .post('/' + Config.settings.version + '/' + model.name)
        .set(Config.settings.auth.key, token)
        .send({ ...Data[model.name].create, invalidField: true })
        .expect(400, HttpStatus.getStatusText(400))
    })
  
    test('return 201 status', async () => {
      await request(server)
        .post('/' + Config.settings.version + '/' + model.name)
        .set(Config.settings.auth.key, token)
        .send(Data[model.name].create)
        .expect(201, { ...Data[model.name].created,
                       ...Data[model.name].update,
                       ...Data[model.name].updated })
    })
  })
}

const testArchive = (model) => {
  const primaryKeyValue = Data[model.name].create.id ? Data[model.name].create.id : 1

  describe('PUT /' + Config.settings.version + '/' + model.name + '/:id/archive should', () => {
    test('return 400 status', async () => {
      await request(server)
        .put('/' + Config.settings.version + '/' + model.name + '/' + primaryKeyValue + '/archive')
        .set(Config.settings.auth.key, token)
        .send({ invalidField: true })
        .expect(400, HttpStatus.getStatusText(400))

      await request(server)
        .put('/' + Config.settings.version + '/' + model.name + '/' + primaryKeyValue + '/archive')
        .set(Config.settings.auth.key, token)
        .send({ ...Data[model.name].create, invalidField: true })
        .expect(400, HttpStatus.getStatusText(400))
    })

    test('return 404 status', async () => {
      await request(server)
        .put('/' + Config.settings.version + '/' + model.name + '/0/archive')
        .set(Config.settings.auth.key, token)
        .send(Data[model.name].update)
        .expect(404, HttpStatus.getStatusText(404))
    })
  
    test('return 204 status', async () => {
      await request(server)
        .put('/' + Config.settings.version + '/' + model.name + '/' + primaryKeyValue + '/archive')
        .set(Config.settings.auth.key, token)
        .send(Data[model.name].update)
        .expect(204)
    })
  })
}


// User
testEmptyGet(sequelize.models.User)
testNewUser(sequelize.models.User)
testGetAll(sequelize.models.User)
testAuthUser(sequelize.models.User)
testPatchCurrentUser(sequelize.models.User)
testGetCurrentUser(sequelize.models.User)


// CRUDs
Object.values(sequelize.models)
  .filter(model => Object.keys(Data).filter(key => Data[key].default).includes(model.name))
  .forEach(model => {
    if (Data[model.name].default) {
      if (Data[model.name].initial) {
        Data[model.name].initial.forEach((initial, index, all) => {
          all[index] = { ...initial,
                         createdAt: Mock.date,
                         updatedAt: Mock.date }
        })
      }

      Data[model.name].created = { ...Data[model.name].create,
                                   ...Data[model.name].created }
    }

    testEmptyGet(model)
    testPost(model)
    testGetAll(model)
    testNotFoundGet(model)
    testGetOne(model)
    testPatch(model)

    if (Config.isTestEnvironment) {
      testDelete(model)
    }
  })


// Log
testEmptyGet(sequelize.models.Log)
testNewLog(sequelize.models.Log)
testGetAll(sequelize.models.Log)
testNotFoundGet(sequelize.models.Log)
testGetOne(sequelize.models.Log)
testArchive(sequelize.models.Log)
testPatchNotAllowed(sequelize.models.Log)


if (Config.isTestEnvironment) {
  testDelete(sequelize.models.Log)

  // Others
  describe('GET / should', () => {
    test('return 302 status and redirect', (done) => {
      request(server)
        .get('/')
        .set(Config.settings.auth.key, token)
        .expect(302)
        .then(response => {
          expect(response.redirect).toBe(true)
          expect(response.header.location).toBe('/Swagger')

          done()
        })
    })
  })

  describe('GET /' + Config.settings.version + '/test/ping should', () => {
    test('return 200 status', async () => {
      await request(server)
        .get('/' + Config.settings.version + '/test/ping')
        .set(Config.settings.auth.key, token)
        .expect(200, 'ping')
    })
  })

  // User
  testNewToken(sequelize.models.User)
  testRequestPasswordChange(sequelize.models.User)
  testPasswordChange(sequelize.models.User)

  describe('GET /' + Config.settings.version + '/test/error should', () => {
    test('return 500 status', async () => {
      console.info('Testing internal error handler... (Please, ignore next messages)')

      await request(server)
        .get('/' + Config.settings.version + '/test/error')
        .set(Config.settings.auth.key, newToken)
        .expect(500, HttpStatus.getStatusText(500))

        console.info('Done (Testing internal error handler).')
    })
  })

  describe('Express server should', () => {
    test('stopped', async (done) => {
      console.info('Testing server start/stop...')

      await Server.stop()
        .then(() => done())
        .catch(error => done(error))
    })

    test('started', async (done) => {
      await Server.start()
        .then(() => done())
        .catch(error => done(error))
    })

    test('stopped', async (done) => {
      await Server.stop()
        .then(() => done())
        .catch(error => done(error))
    })

    test('started', async (done) => {
      await Server.start(true)
        .then(() => done())
        .catch(error => done(error))
      
      console.info('Done (Testing server start/stop).')
    })
  })
}
