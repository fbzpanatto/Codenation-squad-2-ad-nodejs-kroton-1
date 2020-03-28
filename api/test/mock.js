const dateValue = '2020-03-28T00:00:00.000Z'
mockDate = new Date(dateValue)

global.Date = class extends Date {
  constructor() {
    return mockDate
  }
}

module.exports = { date: dateValue }
