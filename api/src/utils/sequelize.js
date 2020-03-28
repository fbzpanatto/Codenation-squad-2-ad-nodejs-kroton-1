const Sequelize = require('sequelize')

const { settings } = require('../config')

const sequelize = new Sequelize(
  settings.db.database,
  settings.db.user,
  settings.db.password,
  settings.db
)

module.exports = sequelize
