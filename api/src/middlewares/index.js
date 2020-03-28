const AuthHandler = require('./auth')
const BodyParser = require('body-parser')
const Compression = require('compression')
const Cors = require('cors')
const ErrorHandler = require('./error')
const Header = require('./header')

module.exports = {  AuthHandler,
                    JsonBodyParser: BodyParser.json(),
                    Compression: Compression(),
                    Cors: Cors(),
                    ErrorHandler,
                    Header }
