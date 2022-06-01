import { renderHook } from '@testing-library/react-hooks'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepo, useUpdateRepo } from './hooks'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const provider = 'gh'
const owner = 'RulaKhaled'
const repo = 'test'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

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

const repoDetails = {
  can_edit: true,
  can_view: true,
  latest_commit: {
    report: {
      files: [
        {
          name: 'src/App.js',
          totals: {
            files: 0,
            lines: 13,
            hits: 13,
            misses: 0,
            partials: 0,
            coverage: 100.0,
            branches: 0,
            methods: 10,
            sessions: 0,
            complexity: 0.0,
            complexity_total: 0.0,
            complexity_ratio: 0,
            diff: null,
          },
        },
      ],
      uploadToken: 'random',
    },
  },
}

describe('useUpdateRepo', () => {
  let hookData

  function setup() {
    server.use(
      rest.patch(`internal/github/codecov/repos/gazebo/`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(repoDetails))
      })
    )
    hookData = renderHook(() => useUpdateRepo(), {
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
      const data = { branch: 'dummy' }
      beforeEach(() => {
        hookData.result.current.mutate(data)
        return hookData.waitFor(() => hookData.result.current.status !== 'idle')
      })

      it('returns isLoading true', () => {
        expect(hookData.result.current.isLoading).toBeTruthy()
      })
    })

    describe('When success', () => {
      beforeEach(async () => {
        hookData.result.current.mutate({})
        await hookData.waitFor(() => hookData.result.current.isLoading)
        await hookData.waitFor(() => !hookData.result.current.isLoading)
      })

      it('returns isSuccess true', () => {
        expect(hookData.result.current.isSuccess).toBeTruthy()
      })
    })
  })
})
