const { DataTypes } = require('sequelize')
const Model = require('../utils/model')

class Config extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      value: DataTypes.STRING
    },
    { sequelize })
  }

  static associate(models) {
  }
}

module.exports = Config
