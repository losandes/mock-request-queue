module.exports = {
  name: 'MockRequest',
  dependencies: ['StatusCodes'],
  factory: (StatusCodes) => {
    'use strict'

    function MockRequest () {
      'use strict'

      const queue = []

      const makeResponse = (requestParams, res) => {
        const url = typeof requestParams === 'string' ? requestParams : requestParams.url
        const request = res.request || { href: url }
        const _res = StatusCodes.valueOf(res.statusCode || res.statusMessage)

        return { ..._res, ...{ request }, ...res }
      }

      const nextRequest = (requestParams, callback) => {
        if (!queue.length) {
          return callback(new Error('A mock request was not registered'))
        }

        const { err, res, body } = queue.shift()
        callback(err, makeResponse(requestParams, res), body)

        return request
      }

      /**
       * Emits request data to a writable stream
       * @param s {stream.Writable} - a writable stream to emit/write request data to
       */
      const pipe = (self, requestParams) => (s) => {
        if (!queue.length) {
          s.emit('error', new Error('A mock request was not registered'))
          return request
        }

        ['emit', 'write', 'end'].forEach((func) => {
          if (typeof s[func] !== 'function') {
            throw new Error('Invalid write stream: pipe expects a writable stream with support for: `emit`, `write`, and `end`')
          }
        })

        const { err, res, body } = queue.shift()

        if (body && body.readable && typeof body.read === 'function') {
          body.on('error', (err) => s.emit('error', err))
          body.on('data', (data) => s.write(data))
          body.on('end', () => {
            s.emit('response', makeResponse(requestParams, res))

            if (err) {
              s.emit('error', err)
            }

            s.emit('end')
            s.end()
          })

          return self
        } else {
          s.emit('response', makeResponse(requestParams, res))

          if (err) {
            s.emit('error', err)
          }

          if (typeof body === 'string') {
            s.write(body)
          } else if (typeof body === 'object') {
            s.write(JSON.stringify(body))
          }

          s.emit('end')
          s.end()

          return self
        }
      }

      function request (requestParams, callback) {
        if (typeof callback === 'function') {
          nextRequest(requestParams, callback)
        }

        const self = {}
        self.pipe = pipe(self, requestParams)

        return self
      }

      const makeParams = (method) => (requestParams) => {
        if (typeof requestParams === 'string') {
          return {
            method: 'GET',
            url: requestParams
          }
        } else if (method) {
          return { ...requestParams, ...{ method } }
        } else {
          return requestParams
        }
      }

      request.get = (requestParams, callback) => request(makeParams('GET')(requestParams), callback)
      request.post = (requestParams, callback) => request(makeParams('POST')(requestParams), callback)
      request.put = (requestParams, callback) => request(makeParams('PUT')(requestParams), callback)
      request.patch = (requestParams, callback) => request(makeParams('PATCH')(requestParams), callback)
      request.delete = (requestParams, callback) => request(makeParams('DELETE')(requestParams), callback)
      request.enqueue = (err, res, body) => {
        queue.push({ err, res, body })

        return request
      }

      return Object.freeze(request)
    }

    return { MockRequest }
  }
}
