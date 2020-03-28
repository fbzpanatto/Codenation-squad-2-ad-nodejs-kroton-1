const { DataTypes } = require('sequelize')
const Config = require('../../config')
const models = require('../../models')

class SwaggerBuild {
  constructor() {
    this.swaggerDocument = require('./swagger.json')

    this.swaggerInit()
  }

  swaggerInit() {
    const domainsTag = 'Domínios'

    this.swaggerDocument.host = Config.serverHost
    this.swaggerDocument.basePath = '/' + Config.settings.version
    this.swaggerDocument.definitions = new Object()

    this.swaggerDocument.tags.push({
      name: domainsTag,
      description: 'CRUDs para entidades auxiliares'
    })

    Object.values(models)
      .filter(model => ![ 'Log' ].includes(model.name))
      .forEach(model => {
        this.swaggerDocument.paths['/' + model.name] = new Object()

        this.swaggerDocument.paths['/' + model.name].get = {
          tags: [ domainsTag ],
          summary: 'Lista registros da entidade ' + model.name,
          description: '',
          responses: {
            200: {
              description: model.name,
              schema: {
                type: 'array',
                items: this.getSchema(model, true)
              }
            },
            401: {
              description: 'Não autorizado'
            }
          },
          security: [ { token: [] } ]
        }

        if (![ 'User' ].includes(model.name)) {
          const primaryKeys = new Object()
          Object.values(model.primaryKeys)
          .forEach(pk => {
            primaryKeys[pk.field] = {
              type: pk.type.key.toLowerCase()
            }
          })

          this.swaggerDocument.paths['/' + model.name].post = {
            tags: [ domainsTag ],
            summary: 'Cria novo registro para a entidade ' + model.name,
            description: '',
            parameters: [ {
              name: 'body',
              in: 'body',
              description: 'New ' + model.name.toLowerCase(),
              required: true,
              schema: this.getSchemaItems(model, false, false, [], true)
            } ],
            responses: {
              201: {
                description: 'Novo registro criado',
                schema: this.getSchemaItems(model, true, true, [ 'updatedAt' ])
              },
              400: {
                description: 'Requisição inválida'
              },
              401: {
                description: 'Não autorizado'
              }
            },
            security: [ { token: [] } ]
          }

          const primaryKeysParameters = new Array()
          Object.values(model.primaryKeys)
            .forEach(pk => {
              primaryKeysParameters.push({
                name: pk.field,
                in: 'path',
                description: model.name + ' key',
                required: true,
                type: pk.type.key.toLowerCase()
              })
            })

          this.swaggerDocument.paths['/' + model.name + '/{' + primaryKeysParameters[0].name + '}'] = {
            get: {
              tags: [ domainsTag ],
              summary: 'Retorna um registro da entidade ' + model.name,
              description: '',
              parameters: primaryKeysParameters,
              responses: {
                200: {
                  description: model.name,
                  schema: this.getSchema(model, true)
                },
                401: {
                  description: 'Não autorizado'
                },
                404: {
                  description: 'Não encontrado'
                }
              },
              security: [ { token: [] } ]
            },
            patch: {
              tags: [ domainsTag ],
              summary: 'Atualiza um registro da entidade ' + model.name,
              description: '',
              parameters: [
                ... primaryKeysParameters,
                {
                  name: 'body',
                  in: 'body',
                  description: model.name,
                  required: true,
                  schema: this.getSchemaItems(model)
                }
              ],
              responses: {
                204: {
                  description: 'Registro atualizado'
                },
                400: {
                  description: 'Requisição inválida'
                },
                401: {
                  description: 'Não autorizado'
                },
                404: {
                  description: 'Não encontrado'
                }
              },
              security: [ { token: [] } ]
            },
            delete: {
              tags: [ domainsTag ],
              summary: 'Exclui um registro da entidade ' + model.name,
              description: '',
              parameters: primaryKeysParameters,
              responses: {
                204: {
                  description: 'Registro excluído'
                },
                401: {
                  description: 'Não autorizado'
                },
                404: {
                  description: 'Não encontrado'
                }
              },
              security: [ { token: [] } ]
            }
          }
        }
      })

    Object.values(models)
      .forEach(model => {
        const properties = {}
        const required = []

        Object.values(model.rawAttributes)
          .forEach(field => {
            if (field.references) {
              const reference = Object.values(models).find(m => m.tableName === field.references.model)

              properties[reference.name] = this.getSchemaItems(reference, false, true)
            } else {
              let type = field.type.key ? field.type.key.toLowerCase() : 'object'
              let format
              if (field.type.key.toLowerCase() === 'date') {
                type = 'string'
                format = 'date-time'
              }

              properties[field.fieldName] = {
                type,
                format,
                default: field.defaultValue instanceof DataTypes.NOW ? 'CURRENT_TIMESTAMP' : field.defaultValue
              }
            }

            if (field.allowNull === false && field.defaultValue === undefined && !field._autoGenerated) {
              required.push(field.fieldName)
            }
          })

        this.swaggerDocument.definitions[model.name] = {
          type: 'object',
          properties,
          required
        }
      })
  }

  getSchema(model, withAutoGenerated = false) {
    if (Object.values(model.rawAttributes)
              .findIndex(field => (!field._autoGenerated && field.allowNull === false && field.unique !== true) ||
                                  (model._scope && model._scope.attributes && model._scope.attributes.exclude.includes(field.fieldName))) === -1) {
      return {
        $ref: '#/definitions/' + model.name
      }
    } else {
      return this.getSchemaItems(model, withAutoGenerated, true)
    }
  }

  getSchemaItems(model, withAutoGenerated = false, withPrimaryKey = false, exclude = [], withNotAutoGeneratedPrimaryKey = false) {
    const primaryKeys = new Object()

    if (withPrimaryKey) {
      Object.values(model.primaryKeys)
        .forEach(pk => {
          primaryKeys[pk.field] = {
            type: pk.type.key.toLowerCase()
          }
        })
    }

    const fields = new Object()
    const required = new Array()
    Object.values(model.rawAttributes)
      .filter(field => (withPrimaryKey || !field.primaryKey || (withNotAutoGeneratedPrimaryKey && field.primaryKey && !field._autoGenerated)) &&
                        (withAutoGenerated || !field._autoGenerated) &&
                        !exclude.includes(field.fieldName) &&
                        (!model._scope || !model._scope.attributes || !model._scope.attributes.exclude.includes(field.fieldName)))
      .forEach(field => {
        let type = field.type.key.toLowerCase()
        let format
        if (field.type.key.toLowerCase() === 'date') {
          type = 'string'
          format = 'date-time'
        }

        fields[field.fieldName] = {
          type,
          format
        }

        if (!field.allowNull && field.defaultValue === undefined) {
          required.push(field.fieldName)
        }
      })

    return {
      title: model.name,
      type: 'object',
      properties: {
        ...primaryKeys,
        ...fields
      },
      required
    }
  }
}

module.exports = new SwaggerBuild()
