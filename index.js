module.exports = function MockRequest () {
  'use strict'

  const queue = []

  function nextRequest (callback) {
    if (!queue.length) {
      return callback(new Error('A mock request was not registered'))
    }

    const res = queue.shift()
    callback(null, res.res, res.body)

    return request
  }

  function request (config, callback) {
    nextRequest(callback)
  }

  request.get = (config, callback) => nextRequest(callback)
  request.post = (config, callback) => nextRequest(callback)
  request.put = (config, callback) => nextRequest(callback)
  request.patch = (config, callback) => nextRequest(callback)
  request.delete = (config, callback) => nextRequest(callback)
  request.enqueue = (res, body) => {
    queue.push({
      res: res,
      body: body
    })

    return request
  }

  return request
}
