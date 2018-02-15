var test = require('supposed')
var MockRequest = require('../index.js')

test('when making a request with 2 args: (url, callback)', {
  given: givenOneEnqueuedRequest,
  when: whenRequestIsCalledWithUrlAndCallback,
  'it should resolve the enqueued request': itShouldResolveTheEnqueuedRequest
})

test('when multiple requests are enqueued', {
  given: givenThreeEnqueuedRequests,
  when: whenRequestIsCalledThreeTimes,
  'it should resolve the enqueued requests in order': itShouldResolveTheEnqueuedRequestsInOrder
})

test('when not enough requests were enqueued', {
  given: givenOneEnqueuedRequest,
  when: whenRequestIsCalledThreeTimes,
  'it should pass an error to the callback': itShouldPassARequestToTheCallback
})

// ---

function givenOneEnqueuedRequest () {
  const request = new MockRequest()
  return request.enqueue({ statusCode: 200 }, { message: 'ok' })
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
    then.equal(actual.res.statusCode, 200)
    then.equal(actual.body.message, 'ok')
  }
}

function givenThreeEnqueuedRequests () {
  const request = new MockRequest()
  request.enqueue({ statusCode: 200 }, { message: 'one' })
  request.enqueue({ statusCode: 200 }, { message: 'two' })
  return request.enqueue({ statusCode: 200 }, { message: 'three' })
}

function whenRequestIsCalledThreeTimes (request) {
  return new Promise((resolve, reject) => {
    const responses = []
    const makePromise = (request, responses) => new Promise((resolve, reject) => {
      request('https://github.com/losandes/supposed', (err, res, body) => {
        responses.push({ err, res, body })
        resolve()
      })
    })

    Promise.resolve()
      .then(() => makePromise(request, responses))
      .then(() => makePromise(request, responses))
      .then(() => makePromise(request, responses))
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
    then.equal(actual[0].res.statusCode, 200)
    then.equal(actual[1].res.statusCode, 200)
    then.equal(actual[2].res.statusCode, 200)
    then.equal(actual[0].body.message, 'one')
    then.equal(actual[1].body.message, 'two')
    then.equal(actual[2].body.message, 'three')
  }
}

function itShouldPassARequestToTheCallback (then) {
  return (err, actual) => {
    then.ifError(err)
    then.ifError(actual[0].err)
    then.equal(actual[1].err.message, 'A mock request was not registered')
    then.equal(actual[2].err.message, 'A mock request was not registered')
  }
}
