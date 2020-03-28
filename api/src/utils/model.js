const Sequelize = require('sequelize')

class Model extends Sequelize.Model {
  static findById(id, attributes = undefined, include = undefined) {
    return this.findOne({
      where: { id },
      attributes,
      include
    })
  }

  static updateById(id, body) {
    return this.update(body, {
      where: { id }
    })
  }

  static destroyById(id) {
    return this.destroy({
      where: { id }
    })
  }
}

module.exports = Model
