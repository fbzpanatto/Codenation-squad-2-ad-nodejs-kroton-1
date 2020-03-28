const Log = require('../services/log')
const models = require('../models')
const { Op } = require('sequelize')

class Service {
  constructor(modelFile, attributes = undefined, include = undefined) {
    this.model = require('../models/' + modelFile)
    this.attributes = attributes
    this.include = include
  }

  getById(request, response, next) {
    try {
      this.model.findById(request.params.id, this.attributes, this.include)
        .then(data => {
          if (data) {
            response.json(data)
          } else {
            Log.send(request, response, next, null, 404)
          }
        })
        .catch(error => Log.send(request, response, next, error))
    } catch (eror) {
      Log.send(request, response, next, error)
    }
  }

  getAll(request, response, next) {

    let mynewObj = {}

    Object.keys(request.query).forEach(key => {
      mynewObj[key.replace(/level/i, "LevelId")] = request.query[key]
      mynewObj[key.replace(/environment/i, "EnvironmentId")] = request.query[key]
    })

   delete mynewObj.level
   delete mynewObj.environment

    try {

      let where = {}

      if (Object.keys(request.query).length > 0){

        for(let param in mynewObj) {
          if(Object.keys(this.model.rawAttributes).includes(param)) {
            const op = isNaN(mynewObj[param]) ? Op.like : Op.eq
            where[param] = { [op]: mynewObj[param] }
          }
        }
      }

      let offset = null
      if (+request.query.pageIndex >= 0 && +request.query.pageCount > 0) {
        offset = +request.query.pageCount * +request.query.pageIndex
      }

      let limit = null
      if (+request.query.pageCount > 0) {
        limit = +request.query.pageCount
      }

      let order = null
      if (request.query.order) {
        order = request.query.order.split(',').map(o => o.split(' '))
      }

      this.model
        .findAndCountAll({ where, attributes: this.attributes, include: this.include, order, offset, limit })
        .then(data => {
          response.json({
            count: data.count,
            data: data.rows
          })
        })
        .catch(error => Log.send(request, response, next, error))
    } catch (error) {
      Log.send(request, response, next, error)
    }
  }

  create(request, response, next) {
    try {
      this.model.create(this.bodyFormat(request.body))
        .then(newData => {
          const attributes = !this.include ? [ ...Object.keys(newData._changed), ...Object.keys(request.body) ].filter((key, index, all) => key !== 'updatedAt' && all.indexOf(key) === index) : undefined

          this.model.findById(newData.id, attributes, this.include)
            .then(data => response.status(201).json(data))
            .catch(error => Log.send(request, response, next, error))
        })
        .catch(error => Log.send(request, response, next, error))
    } catch (eror) {
      Log.send(request, response, next, error)
    }
  }

  update(request, response, next) {
    try {
      this.model.findById(request.params.id, this.attributes, this.include)
        .then(data => {
          if (data) {
            this.model.updateById(request.params.id, this.bodyFormat(request.body))
              .then(() => response.status(204).send())
              .catch(error => Log.send(request, response, next, error))
          } else {
            Log.send(request, response, next, null, 404)
          }
        })
        .catch(error => Log.send(request, response, next, error))
    } catch (eror) {
      Log.send(request, response, next, error)
    }
  }
  
  delete(request, response, next) {
    try {
      this.model.destroyById(request.params.id)
        .then(deleted => {
          if (deleted > 0) {
            response.status(204).send()
          } else {
            Log.send(request, response, next, null, 404)
          }
        })
        .catch(error => Log.send(request, response, next, error))
    } catch (eror) {
      Log.send(request, response, next, error)
    }
  }

  // Move to middleware ??
  notAllowed(request, response, next) {
    Log.send(request, response, next, null, 405)
  }

  // Move to middleware ??
  bodyFormat(body) {
    for (const associationKey in this.model.associations) {     
      if (body[associationKey]) {
        const targetId = this.model.associations[associationKey].targetIdentifier
        const targetValue = body[associationKey][targetId]

        delete(body[associationKey])
        body[associationKey + (targetId.substr(0, 1).toUpperCase() + targetId.substr(1))] = targetValue
      }
    }

    return body
  }

  // Move to middleware ??
  validator(request, response, next, scope = null) {
    try {
      const attributes = scope ? (Object.values(this.model.scope(scope)))[0].attributes : null
      const bodyFields = attributes && attributes.body ? attributes.body : null

      const modelFields = Object.keys(this.model.rawAttributes).map(key => key.substr(0, 1).toLowerCase() + key.substr(1))

      if (bodyFields) {
        let notFoundField = null

        switch (request.method) {
          case 'POST':
            notFoundField = bodyFields.find(key => !Object.keys(request.body).includes(key))
            if (notFoundField) {
              const modelField = Object.values(this.model.rawAttributes).find(field => field.fieldName === notFoundField && field.allowNull === false &&
                                                                                       !field._autoGenerated &&
                                                                                       (field.defaultValue === undefined || field.defaultValue === null))

              if (modelField) {
                throw 'Field \'' + notFoundField + '\' not found'
              }
            }

            break

          case 'PATCH':
            notFoundField = Object.keys(request.body).find(key => ! bodyFields.includes(key))
            if (notFoundField) {
              throw 'Field \'' + notFoundField + '\' not found'
            }

            break
        }
      }

      if (!scope) {
        Object.keys(request.body)
          .forEach(key => {
            if (!modelFields.includes(key)) {
              let model = null
              if (typeof request.body[key] !== 'string') {
                model = Object.values(models).find(m => m.name.toLowerCase() === key)
                
                if (request.body[key] !== null) {
                  const associationKey = Object.keys(this.model.associations).find(k => k.toLowerCase() === key)
                  if (!associationKey) {
                    throw 'Field* \'' + key + '\' not found'
                  } else {
                    const targetValue = request.body[key][this.model.associations[associationKey].targetIdentifier]
                    if (targetValue === undefined || targetValue === null) {
                      throw 'Field \'' + key + '\' has invalid content'
                    }
                  }
                }
              }

              if (!model) {
                throw 'Field** \'' + key + '\' not found'
              }
            }
          })

        switch (request.method) {
          case 'POST':
            Object.values(this.model.rawAttributes)
              .filter(field => field.allowNull === false && !field._autoGenerated && field.fieldName !== 'token' &&
                              (field.defaultValue === undefined || field.defaultValue === null))
              .forEach(field => {
                if (request.body[field.fieldName] === undefined || request.body[field.fieldName] === null || request.body[field.fieldName].toString().trim() === '') {
                  throw 'Field \'' + field.fieldName + '\' is required'
                }
              })
            
            break

          case 'PATCH':
            Object.values(this.model.rawAttributes)
              .filter(field => request.body[field.fieldName] !== undefined && field.allowNull === false && !field._autoGenerated &&
                              (field.defaultValue === undefined || field.defaultValue === null))
              .forEach(field => {
                if (request.body[field.fieldName] === null || request.body[field.fieldName].trim() === '') {
                  throw 'Field \'' + field.fieldName + '\' is required'
                }
              })

            break
        }
      }

      next()
    } catch (error) {
      const sequelizeError = {
        name: 'LogCentralValidatorError',
        message: typeof error === 'string' ? error : undefined,
        original: {
          code: 'ER_NO_REFERENCED_ROW',
          stack: error.stack | error
        }
      }

      Log.send(request, response, next, sequelizeError)
    }
  }
}

module.exports = Service
