const { DataTypes } = require('sequelize')
const Model = require('../utils/model')

class Application extends Model {
  static init(sequelize) {
    return super.init({
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    { sequelize })
  }

  static associate(models) {
    this.hasMany(models.Log, { as: 'log ' })
  }
}

module.exports = Application
