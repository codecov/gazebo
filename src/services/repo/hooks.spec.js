import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'
import { rest } from 'msw'
import { act } from 'react-test-renderer'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepo, useEraseRepoContent } from './hooks'

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const provider = 'gh'
const owner = 'RulaKhaled'
const repo = 'test'

describe('useRepo', () => {
  afterEach(() => server.resetHandlers())

  let hookData
  let expectedResponse

  function setup() {
    server.use(
      graphql.query('GetRepo', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(expectedResponse))
      })
    )

    hookData = renderHook(() => useRepo({ provider, owner, repo }), {
      wrapper,
    })
  }

  describe('when called with successful res', () => {
    expectedResponse = {
      isCurrentUserPartOfOrg: true,
      repository: {
        defaultBranch: 'master',
        private: true,
        uploadToken: 'token',
        profilingToken: 'token',
        graphToken: 'token'
      },
    }
    const dataReturned = {
      owner: {
        isCurrentUserPartOfOrg: true,
        repository: {
          defaultBranch: 'master',
          private: true,
          uploadToken: 'token',
          profilingToken: 'token',
          graphToken: 'token'
        },
      },
    }

    beforeEach(() => {
      setup(dataReturned)
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual(expectedResponse)
      })
    })
  })

  describe('when called with unsuccessful res', () => {
    expectedResponse = {
      repository: undefined,
      isCurrentUserPartOfOrg: undefined,
    }
    const dataReturned = {
      noOwnerSent: 1,
    }

    beforeEach(() => {
      setup(dataReturned)
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual(expectedResponse)
      })
    })
  })
})


describe('useEraseRepoContent', () => {
  let hookData

  function setup() {
    server.use(
      rest.patch(
        `internal/github/codecov/repos/test/erase/`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json())
        }
      )
    )
    hookData = renderHook(() => useEraseRepoContent(), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading false', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      beforeEach(() => {
        hookData.result.current.mutate()
        return hookData.waitFor(() => hookData.result.current.status !== 'idle')
      })

      it('returns isLoading true', () => {
        expect(hookData.result.current.isLoading).toBeTruthy()
      })
    })

    describe('When success', () => {
      beforeEach(async () => {
        return act(async () => {
          hookData.result.current.mutate({})
          await hookData.waitFor(() => hookData.result.current.isLoading)
          await hookData.waitFor(() => !hookData.result.current.isLoading)
        })
      })

      it('returns isSuccess true', () => {
        expect(hookData.result.current.isSuccess).toBeTruthy()
      })
    })
  })
})
