module.exports = (test, dependencies) => {
  'use strict'

  const { MockRequest } = dependencies

  return test('given MockRequest', {
    'when calling `request.get` with 2 args: (url, callback)': {
      given: givenOneEnqueuedRequest,
      when: whenGetIsCalledWithUrlAndCallback,
      'it should resolve the enqueued request': itShouldResolveTheEnqueuedRequest
    },
    'when calling `request.post` with 2 args: (url, callback)': {
      given: givenOneEnqueuedRequest,
      when: whenPostIsCalledWithUrlAndCallback,
      'it should resolve the enqueued request': itShouldResolveTheEnqueuedRequest
    },
    'when calling `request.put` with 2 args: (url, callback)': {
      given: givenOneEnqueuedRequest,
      when: whenPutIsCalledWithUrlAndCallback,
      'it should resolve the enqueued request': itShouldResolveTheEnqueuedRequest
    },
    'when calling `request.patch` with 2 args: (url, callback)': {
      given: givenOneEnqueuedRequest,
      when: whenPatchIsCalledWithUrlAndCallback,
      'it should resolve the enqueued request': itShouldResolveTheEnqueuedRequest
    },
    'when calling `request.delete` with 2 args: (url, callback)': {
      given: givenOneEnqueuedRequest,
      when: whenDeleteIsCalledWithUrlAndCallback,
      'it should resolve the enqueued request': itShouldResolveTheEnqueuedRequest
    }
  })

  // ---

  function givenOneEnqueuedRequest () {
    const request = new MockRequest()
    return request.enqueue(null, { statusCode: 200 }, { message: 'ok' })
  }

  function whenGetIsCalledWithUrlAndCallback (request) {
    return new Promise((resolve, reject) => {
      request.get('https://github.com/losandes/supposed', (err, res, body) => {
        if (err) return reject(err)
        return resolve({ res, body })
      })
    })
  }

  function whenPostIsCalledWithUrlAndCallback (request) {
    return new Promise((resolve, reject) => {
      request.post('https://github.com/losandes/supposed', (err, res, body) => {
        if (err) return reject(err)
        return resolve({ res, body })
      })
    })
  }

  function whenPutIsCalledWithUrlAndCallback (request) {
    return new Promise((resolve, reject) => {
      request.put('https://github.com/losandes/supposed', (err, res, body) => {
        if (err) return reject(err)
        return resolve({ res, body })
      })
    })
  }

  function whenPatchIsCalledWithUrlAndCallback (request) {
    return new Promise((resolve, reject) => {
      request.patch('https://github.com/losandes/supposed', (err, res, body) => {
        if (err) return reject(err)
        return resolve({ res, body })
      })
    })
  }

  function whenDeleteIsCalledWithUrlAndCallback (request) {
    return new Promise((resolve, reject) => {
      request.delete('https://github.com/losandes/supposed', (err, res, body) => {
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
}
