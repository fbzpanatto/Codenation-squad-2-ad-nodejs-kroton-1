const jwt = require(`jsonwebtoken`)
const bcrypt = require(`bcryptjs`)

const Config = require('../config')

class Auth {
  constructor() {
    this.secret = Config.settings.auth.secret
    this.bcrypt = bcrypt
  }

  createToken(email) {
    return new Promise((resolve, reject) => {
      try {
        jwt.sign({ email }, Config.settings.auth.secret, (error, token) => {
          if (error) {
            reject(error)
          } else {
            resolve(token)
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  verifyToken(token) {
    return new Promise((resolve, reject) => {
      try {
        jwt.verify(token, Config.settings.auth.secret, (error, decodedToken) => {
          if (error) {
            reject(error)
          } else {
            resolve(decodedToken)
          }
        });
      } catch {
        reject(error)
      }
    });
  }

  hasToken(request) {
    return this.getToken ? true : false;
  }

  getToken(request) {
    const token = request.header(Config.settings.auth.key);
    return token !== undefined && token.startsWith('Bearer ') ? token.substr(7) : token;
  }

  decodeToken(request) {
    return jwt.decode(this.getToken(request));
  }
}

module.exports = new Auth()
