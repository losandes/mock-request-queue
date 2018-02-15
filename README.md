mock-request-queue
==================

A super-simple mock for the [request](https://github.com/request/request) library. There's nothing fancy about this mock: no route, nor verb matching. It's just an ordered queue that is peeled as your code executes [request](https://github.com/request/request). mock-request-queue doesn't break the Open/Closed Principle by overwriting / monkey patching anything. It's intended to be used with Dependency Injection.

## Installation

```Shell
npm install --save-dev mock-request-queue
```

## Usage
Given the following example module, which accepts an instance of `request` in it's constructor (e.g. constructor injection):

```JavaScript
// UserService.js
module.exports = function UserService (request) {
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
```

If we give the module an instance of MockRequest instead of the request library, we can remove network traffic, and live dependencies from our tests:

```JavaScript
const test = require('supposed')
const MockRequest = require('mock-request-queue')
const UserService = require('./UserService.js')


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
```

### enqueue
Use `request.enqueue` to add a mock response to an instance of `MockRequest`. The order in which you enqueue responses is the order that they will be executed when requests are made. `request.enqueue` accepts 2 arguments:

* **response** {Object} - the mock response
* **body** {Object} - the mock body

> NOTE if you don't enqueue enough requests, additional requests will receive an error in their callback stating that a request wasn't enqueued.

### request
An instance of `MockRequest` returns a function, which can be used without verbs:

```
const MockRequest = require('mock-request-queue')

request('https://github.com/losandes/supposed', (err, res, body) => { /*...*/ })
request({
  method: 'GET',
  url: 'https://github.com/losandes/supposed'
}, (err, res, body) => { /*...*/ })
```

### Verbs
An instance of `MockRequest` returns a function that has `get`, `post`, `put`, `patch`, and `delete` verbs, which can be used instead of the main `request` function.

```
const MockRequest = require('mock-request-queue')

request.get('https://github.com/losandes/supposed', (err, res, body) => { /*...*/ })
request.post({
  url: 'https://github.com/losandes/supposed'
}, (err, res, body) => { /*...*/ })
request.put({
  url: 'https://github.com/losandes/supposed'
}, (err, res, body) => { /*...*/ })
request.patch({
  url: 'https://github.com/losandes/supposed'
}, (err, res, body) => { /*...*/ })
request.delete('https://github.com/losandes/supposed', (err, res, body) => { /*...*/ })
```

> NOTE that enqueue does not perform route, nor verb matching.
