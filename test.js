const { Readable, Writable } = require('stream')
const supposed = require('supposed')
const { StatusCodes, MockRequest } = require('.')

module.exports = supposed.Suite({
  name: 'mock-request-queue',
  inject: { StatusCodes, MockRequest, Readable, Writable }
}).runner().run()
