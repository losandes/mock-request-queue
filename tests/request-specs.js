module.exports = (test, dependencies) => {
  'use strict'

  const { MockRequest } = dependencies

  return test('given MockRequest', {
    'when making a request with 2 args: (url, callback)': {
      given: givenOneEnqueuedRequest,
      when: whenRequestIsCalledWithUrlAndCallback,
      'it should resolve the enqueued request': itShouldResolveTheEnqueuedRequest
    },
    'when multiple requests are enqueued': {
      given: givenThreeEnqueuedRequests,
      when: whenRequestIsCalledThreeTimes,
      'it should resolve the enqueued requests in order': itShouldResolveTheEnqueuedRequestsInOrder
    },
    'when not enough requests were enqueued': {
      given: givenOneEnqueuedRequest,
      when: whenRequestIsCalledThreeTimes,
      'it should pass an error to the callback': itShouldPassARequestToTheCallback
    }
  })

  // ---

  function givenOneEnqueuedRequest () {
    const request = new MockRequest()
    return request.enqueue(null, { statusCode: 200 }, { message: 'ok' })
  }

  function whenRequestIsCalledWithUrlAndCallback (request) {
    return new Promise((resolve, reject) => {
      request('https://github.com/losandes/supposed', (err, res, body) => {
        if (err) return reject(err)
        return resolve({ res, body })
      })
    })
  }

  function itShouldResolveTheEnqueuedRequest (then) {
    return (err, actual) => {
      then.ifError(err)
      then.strictEqual(actual.res.statusCode, 200)
      then.strictEqual(actual.res.statusMessage, 'OK')
      then.strictEqual(actual.res.request.href, 'https://github.com/losandes/supposed')
      then.strictEqual(actual.body.message, 'ok')
    }
  }

  function givenThreeEnqueuedRequests () {
    const request = new MockRequest()
    request.enqueue(null, { statusCode: 200 }, { message: 'one' })
    request.enqueue(null, { statusCode: 200 }, { message: 'two' })
    return request.enqueue(null, { statusCode: 200 }, { message: 'three' })
  }

  function whenRequestIsCalledThreeTimes (request) {
    return new Promise((resolve, reject) => {
      const responses = []
      const makePromise = (idx) => (request, responses) => new Promise((resolve, reject) => {
        request(`https://github.com/losandes/supposed/${idx}`, (err, res, body) => {
          responses.push({ err, res, body })
          resolve()
        })
      })

      Promise.resolve()
        .then(() => makePromise(0)(request, responses))
        .then(() => makePromise(1)(request, responses))
        .then(() => makePromise(2)(request, responses))
        .then(() => resolve(responses))
        .catch(reject)
    })
  }

  function itShouldResolveTheEnqueuedRequestsInOrder (then) {
    return (err, actual) => {
      then.ifError(err)
      then.ifError(actual[0].err)
      then.ifError(actual[1].err)
      then.ifError(actual[2].err)
      then.strictEqual(actual[0].res.statusCode, 200)
      then.strictEqual(actual[1].res.statusCode, 200)
      then.strictEqual(actual[2].res.statusCode, 200)
      then.strictEqual(actual[0].res.statusMessage, 'OK')
      then.strictEqual(actual[1].res.statusMessage, 'OK')
      then.strictEqual(actual[2].res.statusMessage, 'OK')
      then.strictEqual(actual[0].res.request.href, 'https://github.com/losandes/supposed/0')
      then.strictEqual(actual[1].res.request.href, 'https://github.com/losandes/supposed/1')
      then.strictEqual(actual[2].res.request.href, 'https://github.com/losandes/supposed/2')
      then.strictEqual(actual[0].body.message, 'one')
      then.strictEqual(actual[1].body.message, 'two')
      then.strictEqual(actual[2].body.message, 'three')
    }
  }

  function itShouldPassARequestToTheCallback (then) {
    return (err, actual) => {
      then.ifError(err)
      then.ifError(actual[0].err)
      then.strictEqual(actual[1].err.message, 'A mock request was not registered')
      then.strictEqual(actual[2].err.message, 'A mock request was not registered')
    }
  }
}
