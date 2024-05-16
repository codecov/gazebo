import { waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'

import config from 'config'

import Api from './api'
import { AllProvidersArray } from './helpers'

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
    const hasTokenType = Boolean(req.headers.get('token-type'))
    return res(ctx.status(hasTokenType ? 200 : 401), ctx.json(rawUserData))
  }),
  rest.post('/internal/test', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(req.body))
  }),
  rest.patch('/internal/test', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(req.body))
  }),
  rest.delete('/internal/test', (req, res, ctx) => {
    return res(ctx.status(204), ctx.json(null))
  }),
  graphql.query('MyInfo', (req, res, ctx) => {
    return res(
      ctx.data({
        me: 'Codecov',
      })
    )
  }),
  graphql.query('ErrorQuery', (req, res, ctx) => {
    return res(
      ctx.status(400),
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
            __typename: 'Repository',
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
  }),
  graphql.query('UnauthorizationError', (req, res, ctx) => {
    return res(
      ctx.status(403),
      ctx.errors([
        {
          message: 'Unauthorized',
          extensions: {
            status: 403,
          },
        },
      ])
    )
  })
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

let result: any, error: any
function callApi(provider: string | null = null) {
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
  describe('the request is successful', () => {
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
  })

  describe('when different strings entered as provider', () => {
    let fetchSpy: jest.SpyInstance

    afterAll(() => {
      fetchSpy.mockRestore()
    })

    it('does not have the provider in the url for non-provider', async () => {
      const fetchMock = jest.fn((url, options) => {
        expect(url).toBe(`${config.API_URL}/graphql/`)
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { example: 'dummy data' } }),
        })
      })

      // @ts-expect-error - jest spy
      fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(fetchMock)

      await Api.graphql({
        provider: 'random hacks and stuff',
        query: 'query MyInfo { me }',
      })

      expect(fetchMock).toHaveBeenCalled()
    })

    test.each(AllProvidersArray)(
      'has the provider in the url for %s',
      async (provider) => {
        const fetchMock = jest.fn((url, options) => {
          expect(url).toBe(`${config.API_URL}/graphql/${provider}`)
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: { example: 'dummy data' } }),
          })
        })

        // @ts-expect-error - jest spy
        fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(fetchMock)

        await Api.graphql({
          provider: provider,
          query: 'query MyInfo { me }',
        })

        expect(fetchMock).toHaveBeenCalled()
      }
    )
  })

  describe('the request is unsuccessful', () => {
    it('returns the error status code', async () => {
      let error: any
      try {
        await Api.graphql({
          provider: 'gh',
          query: 'query ErrorQuery { me }',
        })
      } catch (err) {
        error = err
      }

      expect(error).toStrictEqual({
        data: { data: { me: 'Codecov' } },
        status: 400,
      })
    })
  })

  describe('when sending an encoded string', () => {
    it('returns a decoded string', async () => {
      const query = `
        query CoverageForFile($owner: String!, $repo: String!, $ref: String!) {
          owner(username: $owner) {
            repository(name: $repo) {
              __typename
              ... on Repository {
                commit(id: $ref) {
                  commitid
                }
              }
            }
          }
        }`

      const result = await Api.graphql({
        provider: 'gh',
        query,
        variables: {
          owner: 'me',
          repo: 'repo',
          ref: 'encoded%2Fstring',
        },
      })

      await waitFor(() =>
        expect(result).toStrictEqual({
          data: {
            owner: {
              repository: {
                __typename: 'Repository',
                commit: { commitid: 'encoded/string' },
              },
            },
          },
        })
      )
    })
  })
})

describe('when using a graphql mutation', () => {
  describe('when the mutation has unauthenticated error', () => {
    it('throws an exception', async () => {
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

      let error: any
      try {
        await Api.graphqlMutation({
          provider: 'gh',
          query: mutation,
          mutationPath: 'createApiToken',
        })
      } catch (err) {
        error = err
      }

      await waitFor(() =>
        expect(error).toEqual({
          __typename: 'UnauthorizedError',
        })
      )
    })
  })

  describe('when the mutation has no error', () => {
    it('resolves with the data', async () => {
      const mutation = `
      mutation CreateToken {
        createApiToken {
          error {
            __typename
          }
          token
        }
      }`

      const result = await Api.graphqlMutation({
        provider: 'gh',
        query: mutation,
        mutationPath: 'createApiToken',
      })

      await waitFor(() =>
        expect(result).toEqual({
          data: {
            createApiToken: {
              token: 123,
              error: null,
            },
          },
        })
      )
    })
  })

  describe('when the mutation supports serviceless', () => {
    it('resolves with the data', async () => {
      const result = await Api.graphqlMutation({
        query: 'query MyInfo { me }',
        mutationPath: 'me',
        supportsServiceless: true,
      })

      await waitFor(() =>
        expect(result).toEqual({
          data: {
            me: 'Codecov',
          },
        })
      )
    })
  })

  describe('when graphql query returns a 401 error', () => {
    config.IS_SELF_HOSTED = true

    beforeAll(() => {
      const location = window.location
      // @ts-expect-error - test magic
      delete global.window.location
      global.window.location = Object.assign({}, location)
    })

    it('has a 403 error', async () => {
      let error

      try {
        await Api.graphql({
          provider: 'gh',
          query: 'query UnauthorizationError { random }',
        })
      } catch (err) {
        error = err
      }

      // @ts-expect-error - test magic
      expect(error.status).toBe(403)
      expect(window.location.href).toBe('/login')
    })
  })
})
