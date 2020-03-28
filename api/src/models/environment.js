const { DataTypes } = require('sequelize')
const Model = require('../utils/model')

class Environment extends Model {
  static init(sequelize) {
    return super.init({
      label: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      }
    },
    { sequelize })
  }

  static associate(models) {
    this.hasMany(models.Log, { as: 'log ' })
  }
}

module.exports = Environment
