const nodemailer = require(`nodemailer`)
const { settings } = require('../../config')

class Mailer {
  constructor() {
    this.transport = nodemailer.createTransport({
      service: settings.mailer.service,
      auth: settings.mailer.auth
    })
  }

  send(to, subject, html) {
    return new Promise((resolve, reject) => {
      try {
        this.transport.sendMail({
          from: settings.mailer.from,
          to,
          subject,
          html
        }, error => {
          if (error) {
            throw error
          }

          resolve()
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}

module.exports = new Mailer()
