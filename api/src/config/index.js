const { NODE_ENV = 'development' } = process.env

class Config {
  constructor() {
    this.settings = require('../../../config/settings')

    this.settings.db.database = this.settings.db.database.replace('#database_environment#', NODE_ENV === 'populate' ? 'development' : NODE_ENV)

    this.settings.auth.exceptions.forEach(exception => exception.url = exception.url.replace('#version#', this.settings.version))

    this.params = process.argv.slice(2)
  }

  get basePath() {
    return this.serverFullHost + '/' + this.settings.version + '/'
  }

  get isDefaultEnvironment() {
    return ![ 'test', 'populate' ].includes(NODE_ENV)
  }

  get isTestEnvironment() {
    return NODE_ENV === 'test'
  }

  get isTestCoverage() {
    return this.isTestEnvironment && this.params.includes('--coverage')
  }

  get isPopulateEnvironment() {
    return NODE_ENV === 'populate'
  }

  get serverHost() {
    return this.settings.server.host + (this.settings.server.host.includes('localhost') ? ':' + this.settings.server.port : '')
  }

  get serverFullHost() {
    return this.settings.server.protocol + '://' + this.serverHost
  }

  get guiHost() {
    return this.settings.gui.protocol + '://' + this.settings.gui.host + (this.settings.gui.host.includes('localhost') ? ':' + this.settings.gui.port : '')
  }
}

module.exports = new Config()
