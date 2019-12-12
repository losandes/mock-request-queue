module.exports = (test, dependencies) => {
  'use strict'

  const { MockRequest, Writable } = dependencies
  const URL = 'https://github.com/losandes/supposed'

  function UserService (request) {
    const getUser = (id) => {
      return new Promise((resolve, reject) => {
        request(URL, (err, res, body) => {
          if (err) return reject(err)
          return resolve({ res, body })
        })
      })
    }

    return { getUser }
  }

  const usage = test('when making a request with 2 args: (url, callback)', {
    given: () => {
      const request = new MockRequest()
      request.enqueue(null, { statusCode: 200 }, { id: 42, name: 'Zaphod' })
      return new UserService(request)
    },
    when: (userService) => userService.getUser(42),
    'it should resolve the enqueued request': (then) => (err, actual) => {
      then.ifError(err)
      then.strictEqual(actual.res.statusCode, 200)
      then.strictEqual(actual.res.statusMessage, 'OK')
      then.strictEqual(actual.res.request.href, URL)
      then.strictEqual(actual.body.id, 42)
      then.strictEqual(actual.body.name, 'Zaphod')
    }
  })

  // pipes ex 1
  class TestWritable extends Writable {
    /**
     * Creates a Writable stream with support for running in a Promise
     * @param resolve {function} - the `resolve` function of a new Promise
     * @param reject {function} - the `reject` function of a new Promise
     */
    constructor (options) {
      super({ ...{ objectMode: true }, ...options })

      if (!options || !options.resolve || !options.reject) {
        throw new Error('Expected expectedBody, and resolve, and reject functions to be provided')
      }

      const { resolve, reject } = options

      this.buffers = []
      this.response = null

      this.on('response', (res) => { this.response = res })
      this.on('error', reject)
      this.on('end', () => resolve({
        res: this.getResponse(),
        body: this.getBody()
      }))
    }

    _write (chunk, encoding, next) {
      this.buffers.push(chunk)
      next()
    }

    getResponse () {
      return this.response
    }

    getBody () {
      return this.buffers.join('')
    }
  }

  // pipes ex 2
  const fs = require('fs')
  const path = require('path')

  // <TestWritable> (from example above)

  const pipes = test('when making a request with 2 args: (url, callback)', {
    given: () => {
      const request = new MockRequest()
      // you can enqueue, a string, an object, or a Readable stream
      request.enqueue(null, { statusCode: 200 }, '{ "message": "ok" }')
      request.enqueue(null, { statusCode: 200 }, { message: 'ok' })
      request.enqueue(
        null,
        { statusCode: 200 },
        fs.createReadStream(path.join(__dirname, 'request-pipe-specs.js'))
      )

      return { request }
    },
    when: ({ request }) => {
      const results = [
        new Promise((resolve, reject) => {
          request('https://github.com/losandes/supposed')
            .pipe(new TestWritable({ resolve, reject }))
        }),
        new Promise((resolve, reject) => {
          request('https://github.com/losandes/supposed')
            .pipe(new TestWritable({ resolve, reject }))
        }),
        new Promise((resolve, reject) => {
          request('https://github.com/losandes/supposed')
            .pipe(new TestWritable({ resolve, reject }))
        })
      ]

      return Promise.all(results)
    },
    'it should pipe the request output to the given writable stream': (then) => (err, results) => {
      then.ifError(err)

      results.forEach((actual) => {
        then.strictEqual(actual.res.statusCode, 200)
        then.strictEqual(actual.res.statusMessage, 'OK')
        then.strictEqual(actual.res.request.href, 'https://github.com/losandes/supposed')
      })
    }
  })

  return Promise.all([usage, pipes])
}
