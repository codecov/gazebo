import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'

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

const mockedPresignedUrl = {presignedUrl: "http://minio:9000/archive/v4/raw/2022-06-23/942173DE95CBF167C5683F40B7DB34C0/ee3ecad424e67419d6c4531540f1ef5df045ff12/919ccc6d-7972-4895-b289-f2d569683a17.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=codecov-default-key%2F20220705%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220705T101702Z&X-Amz-Expires=10&X-Amz-SignedHeaders=host&X-Amz-Signature=8846492d85f62187493cbff3631ec7f0ccf2d355f768eecf294f0572cf758e4c"}

const server = setupServer(
  rest.get('/internal/test', (req, res, ctx) => {
    const hasTokenType = Boolean(req.headers.get('token-type'))
    return res(ctx.status(hasTokenType ? 200 : 401), ctx.json(rawUserData))
  }),
  rest.get('/upload', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockedPresignedUrl))
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
  graphql.query('MyInfo', (req, res, ctx) => {
    return res(
      ctx.data({
        me: 'Codecov',
      })
    )
  }),
  graphql.query('CoverageForFile', (req, res, ctx) => {
    const { ref } = req.variables
    return res(
      ctx.data({
        owner: {
          repository: {
            commit: {
              commitid: ref,
            },
          },
        },
      })
    )
  }),
  graphql.mutation('CreateTokenUnauthorized', (req, res, ctx) => {
    return res(
      ctx.data({
        createApiToken: {
          error: {
            __typename: 'UnauthorizedError',
          },
        },
      })
    )
  }),
  graphql.mutation('CreateToken', (req, res, ctx) => {
    return res(
      ctx.data({
        createApiToken: {
          error: null,
          token: 123,
        },
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

let result, error
function callApi(provider = null) {
  result = null
  error = null
  return Api.get({
    path: '/test',
    provider,
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
    return callApi('gh')
  })

  it('has the data and no error', () => {
    expect(error).toBeNull()
    expect(result).toEqual(userData)
  })
})

describe('when using a get request with upload path', () => {
  beforeEach(() => {
    return Api.get(
      { path: '/upload', provider: 'gh' },
      { useUploadPath: true }
    ).then((data) => {
      result = data
    })
  })

  it('returns data as text', () => {
    expect(result).toEqual(mockedPresignedUrl)
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
    result = Api.graphql({
      provider: 'gh',
      query: 'query MyInfo { me }',
    })
    return result
  })

  it('returns what the server retuns', () => {
    return expect(result).resolves.toEqual({
      data: {
        me: 'Codecov',
      },
    })
  })

  describe('when sending an encoded string', () => {
    beforeEach(() => {
      const query = `
        query CoverageForFile($owner: String!, $repo: String!, $ref: String!) {
          owner(username: $owner) {
            repository(name: $repo){
              commit(id: $ref) {
                commitid
              }
            }
          }
        }
      `
      result = Api.graphql({
        provider: 'gh',
        query,
        variables: {
          owner: 'me',
          repo: 'repo',
          ref: 'encoded%2Fstring',
        },
      })
      return result
    })

    it('returns a decoded string', () => {
      return expect(result).resolves.toEqual({
        data: {
          owner: {
            repository: {
              commit: {
                commitid: 'encoded/string',
              },
            },
          },
        },
      })
    })
  })
})

describe('when using a graphql mutation', () => {
  describe('when the mutation has unauthenticated error', () => {
    const mutation = `
      mutation CreateTokenUnauthorized {
        createApiToken {
          error {
            __typename
          }
          token
        }
      }
    `
    beforeEach(() => {
      result = Api.graphqlMutation({
        provider: 'gh',
        query: mutation,
        mutationPath: 'createApiToken',
      })
    })

    it('throws an expection retuns', () => {
      return expect(result).rejects.toEqual({
        __typename: 'UnauthorizedError',
      })
    })
  })

  describe('when the mutation has no error', () => {
    const mutation = `
      mutation CreateToken {
        createApiToken {
          error {
            __typename
          }
          token
        }
      }
    `
    beforeEach(() => {
      result = Api.graphqlMutation({
        provider: 'gh',
        query: mutation,
        mutationPath: 'createApiToken',
      })
    })

    it('resolves with the data', () => {
      return expect(result).resolves.toEqual({
        data: {
          createApiToken: {
            token: 123,
            error: null,
          },
        },
      })
    })
  })
})
