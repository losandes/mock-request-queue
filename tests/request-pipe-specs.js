module.exports = (test, dependencies) => {
  'use strict'

  const { MockRequest, Readable, Writable } = dependencies

  class TestWritable extends Writable {
    /**
     * Creates a Writable stream with support for running in a Promise
     * @param expectedBody {any} - the body to assert equality with
     * @param resolve {function} - the `resolve` function of a new Promise
     * @param reject {function} - the `reject` function of a new Promise
     */
    constructor (options) {
      super({ ...{ objectMode: true }, ...options })

      if (!options || !options.expectedBody || !options.resolve || !options.reject) {
        throw new Error('Expected expectedBody, and resolve, and reject functions to be provided')
      }

      const { resolve, reject, expectedBody } = options

      this.buffers = []
      this.response = null

      this.on('response', (res) => { this.response = res })
      this.on('error', reject)
      this.on('end', () => resolve({
        expectedBody: expectedBody,
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

  return test('given MockRequest', {
    'with a string enqueued': {
      given: () => {
        const request = new MockRequest()
        const expectedBody = '{ "message": "ok" }'
        request.enqueue(null, { statusCode: 200 }, expectedBody)

        return { expectedBody, request }
      },
      'when a request is piped to a valid writable stream': {
        when: ({ request, expectedBody }) => new Promise((resolve, reject) => {
          const writable = new TestWritable({ expectedBody, resolve, reject })
          request('https://github.com/losandes/supposed').pipe(writable)
        }),
        'it should pipe the request output to the given writable stream': (then) => (err, actual) => {
          then.ifError(err)
          then.strictEqual(actual.res.statusCode, 200)
          then.strictEqual(actual.res.statusMessage, 'OK')
          then.strictEqual(actual.res.request.href, 'https://github.com/losandes/supposed')
          then.strictEqual(actual.body, actual.expectedBody)
        }
      }
    },
    'with an object enqueued': {
      given: () => {
        const request = new MockRequest()
        const expectedBody = '{"message":"ok"}'
        request.enqueue(null, { statusCode: 200 }, JSON.parse(expectedBody))

        return { expectedBody, request }
      },
      'when a request is piped to a valid writable stream': {
        when: ({ request, expectedBody }) => new Promise((resolve, reject) => {
          const writable = new TestWritable({ expectedBody, resolve, reject })
          request('https://github.com/losandes/supposed').pipe(writable)
        }),
        'it should pipe the request output to the given writable stream': (then) => (err, actual) => {
          then.ifError(err)
          then.strictEqual(actual.res.statusCode, 200)
          then.strictEqual(actual.res.statusMessage, 'OK')
          then.strictEqual(actual.res.request.href, 'https://github.com/losandes/supposed')
          then.strictEqual(actual.body, actual.expectedBody)
        }
      }
    },
    'with a stream enqueued': {
      given: () => {
        const request = new MockRequest()
        const expectedBody = '{ "message": "ok" }'
        const readable = new Readable({
          objectMode: true,
          read: function () {}
        })

        readable.push(Buffer.from(expectedBody))
        readable.push(null)

        request.enqueue(null, { statusCode: 200 }, readable)

        return { expectedBody, request }
      },
      'when a request is piped to a valid writable stream': {
        when: ({ request, expectedBody }) => new Promise((resolve, reject) => {
          const writable = new TestWritable({ expectedBody, resolve, reject })
          request('https://github.com/losandes/supposed').pipe(writable)
        }),
        'it should pipe the request output to the given writable stream': (then) => (err, actual) => {
          then.ifError(err)
          then.strictEqual(actual.res.statusCode, 200)
          then.strictEqual(actual.res.statusMessage, 'OK')
          then.strictEqual(actual.res.request.href, 'https://github.com/losandes/supposed')
          then.strictEqual(actual.body, actual.expectedBody)
        }
      }
    }

  })
}
