const { DataTypes } = require('sequelize')
const Model = require('../utils/model')

class User extends Model {
  static init(sequelize) {
    return super.init({
      name:	{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      password:	{
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      token: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    { sequelize,
      defaultScope: {
        attributes: {
          exclude: [ 'password', 'token' ]
        },
      },
      scopes: {
        signIn: {
          attributes: {
            body: [ 'email', 'password' ],
            includes: [ 'name', 'token' ]
          }
        },
        resendEmail: {
          attributes: {
            includes: [ 'token', 'name', 'email' ]
          }
        },
        passwordChange: {
          attributes: {
            body: [ 'password' ],
            includes: [ 'token', 'name', 'email' ]
          }
        },
        updateUser: {
          attributes: {
            body: [ 'name', 'email', 'active' ]
          }
        },
        withToken: {
          attributes: {
            exclude: [ 'password' ]
          }
        }
      }
    })
  }

  static associate(models) {
    this.hasMany(models.Log, { as: 'log ' })
  }
}

module.exports = User
