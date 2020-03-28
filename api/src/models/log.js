const { DataTypes } = require('sequelize')
const Model = require('../utils/model')
const models = require('./')

class Log extends Model {
  static init(sequelize) {
    return super.init({
      url: DataTypes.STRING,
      message: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      data: DataTypes.JSON,
      datetime:	{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      sourceAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      localDatetime:	{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    { sequelize,
      defaultScope: {
        attributes: {
          exclude: [ 'applicationId', 'environmentId', 'levelId', 'methodId', 'userId',
                     'ApplicationId', 'EnvironmentId', 'LevelId', 'MethodId', 'UserId' ]
        },
      }
    })
  }

  static associate(models) {
    this.belongsTo(models.Application, { as: 'application' })
    this.belongsTo(models.Method, { as: 'method' })
    this.belongsTo(models.Level, { as: 'level' })
    this.belongsTo(models.User, { as: 'user' })
    this.belongsTo(models.Environment, { as: 'environment' })
  }
}

module.exports = Log
