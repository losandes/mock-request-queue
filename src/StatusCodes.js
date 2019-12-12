module.exports = {
  name: 'StatusCodes',
  dependencies: [],
  factory: () => {
    'use strict'

    const StatusCodes = {
      ACCEPTED: { statusCode: 202, statusMessage: 'Accepted' },
      BAD_GATEWAY: { statusCode: 502, statusMessage: 'Bad Gateway' },
      BAD_REQUEST: { statusCode: 400, statusMessage: 'Bad Request' },
      CONFLICT: { statusCode: 409, statusMessage: 'Conflict' },
      CONTINUE: { statusCode: 100, statusMessage: 'Continue' },
      CREATED: { statusCode: 201, statusMessage: 'Created' },
      EXPECTATION_FAILED: { statusCode: 417, statusMessage: 'Expectation Failed' },
      FAILED_DEPENDENCY: { statusCode: 424, statusMessage: 'Failed Dependency' },
      FORBIDDEN: { statusCode: 403, statusMessage: 'Forbidden' },
      GATEWAY_TIMEOUT: { statusCode: 504, statusMessage: 'Gateway Timeout' },
      GONE: { statusCode: 410, statusMessage: 'Gone' },
      HTTP_VERSION_NOT_SUPPORTED: { statusCode: 505, statusMessage: 'HTTP Version Not Supported' },
      IM_A_TEAPOT: { statusCode: 418, statusMessage: "I'm a teapot" },
      INSUFFICIENT_SPACE_ON_RESOURCE: { statusCode: 419, statusMessage: 'Insufficient Space on Resource' },
      INSUFFICIENT_STORAGE: { statusCode: 507, statusMessage: 'Insufficient Storage' },
      INTERNAL_SERVER_ERROR: { statusCode: 500, statusMessage: 'Server Error' },
      LENGTH_REQUIRED: { statusCode: 411, statusMessage: 'Length Required' },
      LOCKED: { statusCode: 423, statusMessage: 'Locked' },
      METHOD_FAILURE: { statusCode: 420, statusMessage: 'Method Failure' },
      METHOD_NOT_ALLOWED: { statusCode: 405, statusMessage: 'Method Not Allowed' },
      MOVED_PERMANENTLY: { statusCode: 301, statusMessage: 'Moved Permanently' },
      MOVED_TEMPORARILY: { statusCode: 302, statusMessage: 'Moved Temporarily' },
      MULTI_STATUS: { statusCode: 207, statusMessage: 'Multi-Status' },
      MULTIPLE_CHOICES: { statusCode: 300, statusMessage: 'Multiple Choices' },
      NETWORK_AUTHENTICATION_REQUIRED: { statusCode: 511, statusMessage: 'Network Authentication Required' },
      NO_CONTENT: { statusCode: 204, statusMessage: 'No Content' },
      NON_AUTHORITATIVE_INFORMATION: { statusCode: 203, statusMessage: 'Non Authoritative Information' },
      NOT_ACCEPTABLE: { statusCode: 406, statusMessage: 'Not Acceptable' },
      NOT_FOUND: { statusCode: 404, statusMessage: 'Not Found' },
      NOT_IMPLEMENTED: { statusCode: 501, statusMessage: 'Not Implemented' },
      NOT_MODIFIED: { statusCode: 304, statusMessage: 'Not Modified' },
      OK: { statusCode: 200, statusMessage: 'OK' },
      PARTIAL_CONTENT: { statusCode: 206, statusMessage: 'Partial Content' },
      PAYMENT_REQUIRED: { statusCode: 402, statusMessage: 'Payment Required' },
      PERMANENT_REDIRECT: { statusCode: 308, statusMessage: 'Permanent Redirect' },
      PRECONDITION_FAILED: { statusCode: 412, statusMessage: 'Precondition Failed' },
      PRECONDITION_REQUIRED: { statusCode: 428, statusMessage: 'Precondition Required' },
      PROCESSING: { statusCode: 102, statusMessage: 'Processing' },
      PROXY_AUTHENTICATION_REQUIRED: { statusCode: 407, statusMessage: 'Proxy Authentication Required' },
      REQUEST_HEADER_FIELDS_TOO_LARGE: { statusCode: 431, statusMessage: 'Request Header Fields Too Large' },
      REQUEST_TIMEOUT: { statusCode: 408, statusMessage: 'Request Timeout' },
      REQUEST_TOO_LONG: { statusCode: 413, statusMessage: 'Request Entity Too Large' },
      REQUEST_URI_TOO_LONG: { statusCode: 414, statusMessage: 'Request-URI Too Long' },
      REQUESTED_RANGE_NOT_SATISFIABLE: { statusCode: 416, statusMessage: 'Requested Range Not Satisfiable' },
      RESET_CONTENT: { statusCode: 205, statusMessage: 'Reset Content' },
      SEE_OTHER: { statusCode: 303, statusMessage: 'See Other' },
      SERVICE_UNAVAILABLE: { statusCode: 503, statusMessage: 'Service Unavailable' },
      SWITCHING_PROTOCOLS: { statusCode: 101, statusMessage: 'Switching Protocols' },
      TEMPORARY_REDIRECT: { statusCode: 307, statusMessage: 'Temporary Redirect' },
      TOO_MANY_REQUESTS: { statusCode: 429, statusMessage: 'Too Many Requests' },
      UNAUTHORIZED: { statusCode: 401, statusMessage: 'Unauthorized' },
      UNPROCESSABLE_ENTITY: { statusCode: 422, statusMessage: 'Unprocessable Entity' },
      UNSUPPORTED_MEDIA_TYPE: { statusCode: 415, statusMessage: 'Unsupported Media Type' },
      USE_PROXY: { statusCode: 305, statusMessage: 'Use Proxy' }
    }

    const BY_CODE = Object.keys(StatusCodes).reduce((map, key) => {
      const code = StatusCodes[key]
      map[`c${code.statusCode}`] = code
      return map
    }, {})

    const BY_MESSAGE = Object.keys(StatusCodes).reduce((map, key) => {
      const code = StatusCodes[key]
      map[`${code.statusMessage}`] = code
      return map
    }, {})

    StatusCodes.valueOfStatusCode = (statusCode) => BY_CODE[`c${statusCode}`]
    StatusCodes.valueOfStatusMessage = (statusMessage) => BY_MESSAGE[statusMessage]
    StatusCodes.valueOf = (statusCodeOrMessage) => typeof statusCodeOrMessage === 'number'
      ? StatusCodes.valueOfStatusCode(statusCodeOrMessage)
      : StatusCodes.valueOfStatusMessage(statusCodeOrMessage)

    return { StatusCodes }
  }
}
