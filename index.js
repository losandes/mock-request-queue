const { StatusCodes } = require('./src/StatusCodes').factory()
const { MockRequest } = require('./src/MockRequest').factory(StatusCodes)

module.exports = { StatusCodes, MockRequest }
