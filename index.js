const { Duplex } = require('stream')
const { StatusCodes } = require('./src/StatusCodes').factory()
const { MockRequest } = require('./src/MockRequest').factory(StatusCodes, Duplex)

module.exports = { StatusCodes, MockRequest }
