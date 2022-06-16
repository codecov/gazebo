import { renderHook } from '@testing-library/react-hooks'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import {
  useEraseRepoContent,
  useRepo,
  useRepoContents,
  useUpdateRepo,
} from './hooks'

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
        yaml: 'yaml',
      },
    }
    const dataReturned = {
      owner: {
        isCurrentUserPartOfOrg: true,
        repository: {
          defaultBranch: 'master',
          private: true,
          uploadToken: 'token',
          yaml: 'yaml',
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
      rest.patch(`internal/github/codecov/repos/test/`, (req, res, ctx) => {
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

describe('useRepoContents', () => {
  const dataReturned = {
    owner: {
      username: 'Rabee-AbuBaker',
      repository: {
        branch: {
          head: {
            pathContents: [
              {
                name: 'flag1',
                filePath: null,
                percentCovered: 100.0,
                type: 'dir',
              },
            ],
          },
        },
      },
    },
  }

  let hookData

  function setup() {
    server.use(
      graphql.query('BranchFiles', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )

    hookData = renderHook(
      () =>
        useRepoContents({
          provider: 'gh',
          owner: 'Rabee-AbuBaker',
          repo: 'another-test',
          branch: 'main',
          path: '',
        }),
      {
        wrapper,
      }
    )
  }

  describe('when called', () => {
    const expectedResponse = [
      {
        name: 'flag1',
        filePath: null,
        percentCovered: 100.0,
        type: 'dir',
      },
    ]

    beforeEach(() => {
      setup()
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
})
