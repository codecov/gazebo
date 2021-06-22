import { rest } from 'msw'
import { setupServer } from 'msw/node'
import * as Cookie from 'js-cookie'

import Api from './api'

const rawUserData = {
  profile: {
    username: 'hello',
    nb_orgs: 3,
  },
  orgs: [
    { id: 1, long_name: 'Codecov' },
    { id: 2, long_name: 'Github' },
  ],
}

// name in camelcase
const userData = {
  profile: {
    username: 'hello',
    nbOrgs: 3,
  },
  orgs: [
    { id: 1, longName: 'Codecov' },
    { id: 2, longName: 'Github' },
  ],
}

const server = setupServer(
  rest.get('/internal/test', (req, res, ctx) => {
    const hasToken = Boolean(req.headers.get('authorization'))
    return res(ctx.status(hasToken ? 200 : 401), ctx.json(rawUserData))
  }),
  rest.post('/internal/test', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(req.body))
  }),
  rest.patch('/internal/test', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(req.body))
  }),
  rest.delete('/internal/test', (req, res, ctx) => {
    return res(ctx.status(204), null)
  }),
  rest.post('/graphql/gh', (req, res, ctx) => {
    return res(
      ctx.status(204),
      ctx.json({
        me: 'Codecov',
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

let result, error
function callApi() {
  result = null
  error = null
  return Api.get({
    path: '/test',
  })
    .then((data) => {
      result = data
    })
    .catch((errorData) => {
      error = errorData
    })
}

describe('when calling an endpoint without a token', () => {
  beforeEach(callApi)

  it('has a 401 error', () => {
    expect(error.status).toBe(401)
  })
})

describe('when calling an endpoint with a token', () => {
  beforeEach(() => {
    Cookie.set('github-token', 'hello')
    return callApi()
  })

  afterEach(() => {
    Cookie.remove('github-token')
  })

  it('has the data and no error', () => {
    expect(error).toBeNull()
    expect(result).toEqual(userData)
  })
})

describe('when using a post request', () => {
  const body = {
    test: 'foo',
    camel_case: 'snakeCase',
  }
  beforeEach(() => {
    return Api.post({
      path: '/test',
      body,
    }).then((data) => {
      result = data
    })
  })

  it('returns the data, and transform to camelCase', () => {
    expect(result).toEqual({
      test: 'foo',
      camelCase: 'snakeCase',
    })
  })
})

describe('when using a patch request', () => {
  const body = {
    test: 'foo',
    camel_case: 'snakeCase',
  }
  beforeEach(() => {
    return Api.patch({
      path: '/test',
      body,
    }).then((data) => {
      result = data
    })
  })

  it('returns the data, and transform to camelCase', () => {
    expect(result).toEqual({
      test: 'foo',
      camelCase: 'snakeCase',
    })
  })
})

describe('when using a delete request', () => {
  beforeEach(() => {
    return Api.delete({
      path: '/test',
    }).then((data) => {
      result = data
    })
  })

  it('returns null', () => {
    expect(result).toEqual(null)
  })
})

describe('when using a graphql request', () => {
  beforeEach(() => {
    return Api.graphql({
      provider: 'gh',
      query: '{ me }',
    }).then((data) => {
      result = data
    })
  })

  it('returns what the server retuns', () => {
    expect(result).toEqual({
      me: 'Codecov',
    })
  })
})
