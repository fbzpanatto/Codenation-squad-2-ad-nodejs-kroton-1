const fs = require('fs')
const path = require('path')
const sequelize = require('../utils/sequelize')

const models = {}

const files = fs.readdirSync(path.resolve('./api/src/models'))

files.filter(file => file !== 'index.js')
     .forEach(file => {
  const model = require(path.resolve('./api/src/models', file))

  if (typeof model.init === 'function') {
    models[model.name] = model.init(sequelize)
  }
})

Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models)
  }

  module.exports[model.name] = model
})
