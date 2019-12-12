module.exports = {
  name: 'MockRequest',
  dependencies: ['StatusCodes', 'Duplex'],
  factory: (StatusCodes, Duplex) => {
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

      const getNextRequest = (requestParams) => {
        if (!queue.length) {
          return {
            err: new Error('A mock request was not registered')
          }
        }

        const { err, res, body } = queue.shift()
        return {
          err,
          res: makeResponse(requestParams, res),
          body
        }
      }

      class MockReadable extends Duplex {
        constructor ({ err, res, body }) {
          super({ objectMode: true })
          this.body = body

          this.err = err
          this.res = res
          this.body = body
        }

        _write () {}

        _read () {
          const { err, res, body } = this

          if (this.err) {
            this.emit('error', err)
          } else {
            this.emit('response', res)
            this.push(JSON.stringify(body))
            this.push(null)
          }
        }

        pipe (s) {
          const { err, res, body } = this;

          ['emit', 'write', 'end'].forEach((func) => {
            if (typeof s[func] !== 'function') {
              throw new Error('Invalid write stream: pipe expects a writable stream with support for: `emit`, `write`, and `end`')
            }
          })

          if (body && body.readable && typeof body.read === 'function') {
            body.on('error', (err) => s.emit('error', err))
            body.on('data', (data) => s.write(data))
            body.on('end', () => {
              s.emit('response', res)

              if (err) {
                s.emit('error', err)
              }

              s.emit('end')
              s.end()
            })

            return this
          } else {
            s.emit('response', res)

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

            return this
          }
        }
      }

      function request (requestParams, callback) {
        const { err, res, body } = getNextRequest(requestParams)

        if (callback) {
          callback(err, res, body)
        }

        return new MockReadable({ err, res, body })
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
