import { waitFor } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { type MockInstance } from 'vitest'

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

const server = setupServer()

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  vi.clearAllMocks()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

function setup() {
  server.use(
    http.get('/internal/test', (info) => {
      const hasTokenType = Boolean(info.request.headers.get('token-type'))

      return HttpResponse.json(rawUserData, {
        status: hasTokenType ? 200 : 401,
      })
    }),
    http.post('/internal/test', async (info) => {
      const data = await info.request.json()
      return HttpResponse.json(data)
    }),
    http.patch('/internal/test', async (info) => {
      const data = await info.request.json()
      return HttpResponse.json(data)
    }),
    http.delete('/internal/test', (info) => {
      return HttpResponse.json(null)
    }),
    graphql.query('MyInfo', (info) => {
      return HttpResponse.json({ data: { me: 'Codecov' } })
    }),
    graphql.query('ErrorQuery', (info) => {
      return HttpResponse.json({ data: { me: 'Codecov' } }, { status: 400 })
    }),
    graphql.query('CoverageForFile', (info) => {
      const { ref } = info.variables
      return HttpResponse.json({
        data: {
          owner: {
            repository: {
              __typename: 'Repository',
              commit: {
                commitid: ref,
              },
            },
          },
        },
      })
    }),
    graphql.mutation('CreateTokenUnauthorized', (info) => {
      return HttpResponse.json({
        data: {
          createApiToken: {
            error: {
              __typename: 'UnauthorizedError',
            },
          },
        },
      })
    }),
    graphql.mutation('CreateToken', (info) => {
      return HttpResponse.json({
        data: {
          createApiToken: {
            error: null,
            token: 123,
          },
        },
      })
    }),
    graphql.query('UnauthorizationError', (info) => {
      return HttpResponse.json(
        {
          errors: [
            {
              message: 'Unauthorized',
              extensions: {
                status: 403,
              },
            },
          ],
        },
        { status: 403 }
      )
    })
  )
}

describe('when calling an endpoint without a token', () => {
  it('has a 401 error', async () => {
    setup()
    let error: any
    try {
      const data = await Api.get({
        path: '/test',
        provider: null,
      })
      console.debug(data)
    } catch (e) {
      error = e
    }

    await waitFor(() => expect(error!.status).toBe(401))
  })
})

describe('when calling an endpoint with a token', () => {
  it('has the data and no error', async () => {
    setup()
    let result: any
    let error: any = null
    try {
      result = await Api.get({
        path: '/test',
        provider: 'gh',
      })
    } catch (e) {
      error = e
    }

    expect(error).toBeNull()
    expect(result).toEqual(userData)
  })
})

describe('when using a post request', () => {
  it('returns the data, and transform to camelCase', async () => {
    setup()
    const result = await Api.post({
      path: '/test',
      body: {
        test: 'foo',
        camel_case: 'snakeCase',
      },
    })

    expect(result).toEqual({
      test: 'foo',
      camelCase: 'snakeCase',
    })
  })
})

describe('when using a patch request', () => {
  it('returns the data, and transform to camelCase', async () => {
    setup()
    const result = await Api.patch({
      path: '/test',
      body: {
        test: 'foo',
        camel_case: 'snakeCase',
      },
    })

    expect(result).toEqual({
      test: 'foo',
      camelCase: 'snakeCase',
    })
  })
})

describe('when using a delete request', () => {
  it('returns null', async () => {
    setup()
    const result = await Api.delete({
      path: '/test',
    })

    expect(result).toEqual(null)
  })
})

describe('when using a graphql request', () => {
  describe('the request is successful', () => {
    it('returns what the server returns', async () => {
      setup()
      const result = await Api.graphql({
        provider: 'gh',
        query: 'query MyInfo { me }',
      })

      return expect(result).toEqual({
        data: {
          me: 'Codecov',
        },
      })
    })
  })

  describe('when graphql query returns a 403 error', () => {
    beforeAll(() => {
      config.IS_SELF_HOSTED = true
      const location = window.location
      // @ts-expect-error - test magic
      delete global.window.location
      global.window.location = Object.assign({}, location)
    })

    afterAll(() => {
      config.IS_SELF_HOSTED = false
    })

    it('has a 403 error', async () => {
      setup()
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

  describe('when different strings entered as provider', () => {
    let fetchSpy: MockInstance

    afterAll(() => {
      vi.restoreAllMocks()
      fetchSpy.mockRestore()
    })

    it('does not have the provider in the url for non-provider', async () => {
      setup()
      const fetchMock = vi.fn((url, options) => {
        expect(url).toBe(`${config.API_URL}/graphql/`)
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { example: 'dummy data' } }),
        })
      })

      // @ts-expect-error - vi spy
      fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(fetchMock)

      await Api.graphql({
        provider: 'random hacks and stuff',
        query: 'query MyInfo { me }',
      })

      expect(fetchMock).toHaveBeenCalled()
    })

    test.each(AllProvidersArray)(
      'has the provider in the url for %s',
      async (provider) => {
        setup()
        const fetchMock = vi.fn((url, options) => {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: { example: 'dummy data' } }),
          })
        })

        // @ts-expect-error - vi spy
        fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(fetchMock)

        await Api.graphql({
          provider: provider,
          query: 'query MyInfo { me }',
        })

        expect(fetchMock).toHaveBeenCalled()
        expect(fetchMock).toHaveBeenCalledWith(
          `/graphql/${provider}`,
          expect.any(Object)
        )
      }
    )
  })

  describe('the request is unsuccessful', () => {
    it('returns the error status code', async () => {
      setup()
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
      setup()
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
      setup()
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
        const data = await Api.graphqlMutation({
          provider: 'gh',
          query: mutation,
          mutationPath: 'createApiToken',
        })
        console.debug(data)
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
      setup()
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

  describe('when the mutation supports service-less', () => {
    it('resolves with the data', async () => {
      setup()
      const result = await Api.graphqlMutation({
        query: 'mutation CreateToken { createApiToken { error token } }',
        mutationPath: 'createApiToken',
        supportsServiceless: true,
      })

      await waitFor(() =>
        expect(result).toEqual({
          data: {
            createApiToken: {
              error: null,
              token: 123,
            },
          },
        })
      )
    })
  })
})
