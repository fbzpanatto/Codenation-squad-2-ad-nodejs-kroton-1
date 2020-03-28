const Server = require('./services/server')
Server.start()
  .catch(error => console.error(error))

const FrontSample = require('./services/front-sample')
FrontSample.start()
  .catch(error => console.error(error))
