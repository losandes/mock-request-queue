mock-request-queue
==================

A super-simple mock for the [request](https://github.com/request/request) library. There's nothing fancy about this mock: no route, nor verb matching. It's just an ordered queue that is consumed as your code executes [request](https://github.com/request/request). mock-request-queue doesn't break the Open/Closed Principle by overwriting / monkey patching anything. It's intended to be used with Dependency Injection (injecting an instance that meets the request interface into your modules).

> NOTE mock-request-queue doesn't implement the entire request interface, however common functions are supplied: `request`, `request.get`, `request.post`, `request.put`, `request.patch`, `request.delete`, `request(...).pipe`.

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
const { MockRequest } = require('mock-request-queue')
const UserService = require('./UserService.js')


test('when making a request with 2 args: (url, callback)', {
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
    then.strictEqual(actual.res.request.href, 'https://github.com/losandes/supposed')
    then.strictEqual(actual.body.id, 42)
    then.strictEqual(actual.body.name, 'Zaphod')
  }
})
```

### enqueue
Use `request.enqueue` to add a mock response to an instance of `MockRequest`. The order in which you enqueue responses is the order that they will be executed when requests are made. `request.enqueue` accepts 3 arguments:

* **err** {Error} - a mock request level error
* **response** {Object} - the mock response
* **body** {Object} - the mock body

> NOTE if you don't enqueue enough requests, additional requests will receive an error in their callback stating that a request wasn't enqueued.

### request
An instance of `MockRequest` returns a function, which can be used without verbs:

```JavaScript
const { MockRequest } = require('mock-request-queue')

request('https://github.com/losandes/supposed', (err, res, body) => { /*...*/ })
request({
  method: 'GET',
  url: 'https://github.com/losandes/supposed'
}, (err, res, body) => { /*...*/ })
```

### Verbs
An instance of `MockRequest` returns a function that has `get`, `post`, `put`, `patch`, and `delete` verbs, which can be used instead of the main `request` function.

```JavaScript
const { MockRequest } = require('mock-request-queue')

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

### Streams
To pipe a mock stream, skip passing the `callback` to `request`. First, let's look at an example writable stream / consumer:

```JavaScript
const { Writable } = require('stream')

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
```

Given a writable stream like this, we can:

```JavaScript
const fs = require('fs')
const path = require('path')
const test = require('supposed')
const { MockRequest } = require('mock-request-queue')

// <TestWritable> (from example above)

test('when making a request with 2 args: (url, callback)', {
  given: () => {
    const request = new MockRequest()
    // you can enqueue, a string, an object, or a Readable stream
    request.enqueue(null, { statusCode: 200 }, '{ "message": "ok" }')
    request.enqueue(null, { statusCode: 200 }, { message: 'ok' })
    request.enqueue(
      null,
      { statusCode: 200 },
      fs.createReadStream(path.join(__dirname, 'README.md'))
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
```
