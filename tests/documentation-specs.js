function UserService (request) {
  const getUser = (id) => {
    return new Promise((resolve, reject) => {
      request('https://github.com/losandes/supposed', (err, res, body) => {
        if (err) return reject(err)
        return resolve({ res, body })
      })
    })
  }

  return { getUser }
}

const test = require('supposed')
const MockRequest = require('../index.js')

test('when making a request with 2 args: (url, callback)', {
  given: () => {
    const request = new MockRequest()
    request.enqueue({ statusCode: 200 }, { id: 42, name: 'Zaphod' })
    return new UserService(request)
  },
  when: (userService) => userService.getUser(42),
  'it should resolve the enqueued request': (then) => (err, actual) => {
    then.ifError(err)
    then.equal(actual.res.statusCode, 200)
    then.equal(actual.body.id, 42)
    then.equal(actual.body.name, 'Zaphod')
  }
})
