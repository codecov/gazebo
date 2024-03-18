import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import {
  useActivateFlagMeasurements,
  useEraseRepoContent,
  useRepo,
  useRepoBackfilled,
  useUpdateRepo,
} from './index'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = '/gh/codecov/test') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner/:repo">
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
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
  function setup(apiData) {
    server.use(
      graphql.query('GetRepo', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(apiData))
      })
    )
  }

  describe('when called with unsuccessful res', () => {
    const badData = {
      owner: {
        isCurrentUserPartOfOrg: '',
        isAdmin: '',
        isCurrentUserActivated: '',
        repository: {},
      },
    }

    beforeEach(() => {
      setup(badData)
    })

    describe('when incorrect data is loaded', () => {
      it('throws an error', async () => {
        const { result } = renderHook(
          () => useRepo({ provider, owner, repo }),
          {
            wrapper: wrapper(),
          }
        )

        await waitFor(() => expect(result.current.status).toEqual('error'))
      })
    })
  })

  describe('when called with successful res', () => {
    const dataReturned = {
      owner: {
        isCurrentUserPartOfOrg: true,
        isAdmin: null,
        isCurrentUserActivated: null,
        repository: {
          __typename: 'Repository',
          defaultBranch: 'master',
          private: true,
          uploadToken: 'token',
          yaml: 'yaml',
          active: true,
          activated: true,
          oldestCommitAt: '',
        },
      },
    }

    beforeEach(() => {
      setup(dataReturned)
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () => useRepo({ provider, owner, repo }),
          {
            wrapper: wrapper(),
          }
        )

        const expectedResponse = {
          isCurrentUserPartOfOrg: true,
          isAdmin: null,
          isCurrentUserActivated: null,
          repository: {
            __typename: 'Repository',
            defaultBranch: 'master',
            private: true,
            uploadToken: 'token',
            yaml: 'yaml',
            active: true,
            activated: true,
            oldestCommitAt: '',
          },
        }

        await waitFor(() =>
          expect(result.current.data).toEqual(expectedResponse)
        )
      })
    })
  })
})

describe('useEraseRepoContent', () => {
  function setup() {
    server.use(
      rest.patch(
        `internal/github/codecov/repos/test/erase/`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json())
        }
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('When success', () => {
      it('returns isSuccess true', async () => {
        const { result } = renderHook(() => useEraseRepoContent(), {
          wrapper: wrapper(),
        })

        result.current.mutate(null)

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
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
  function setup() {
    server.use(
      rest.patch(`internal/github/codecov/repos/test/`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(repoDetails))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('When success', () => {
      it('returns isSuccess true', async () => {
        const { result } = renderHook(() => useUpdateRepo(), {
          wrapper: wrapper(),
        })

        result.current.mutate({})

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })
    })
  })
})

describe('useRepoBackfilled', () => {
  const dataReturned = {
    owner: {
      repository: {
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: true,
      },
    },
  }

  function setup() {
    server.use(
      graphql.query('BackfillFlagMemberships', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useRepoBackfilled({
              provider: 'gh',
              owner: 'owner',
              repo: 'another-test',
            }),
          {
            wrapper: wrapper(),
          }
        )

        const expectedResponse = {
          flagsMeasurementsActive: true,
          flagsMeasurementsBackfilled: true,
        }
        await waitFor(() =>
          expect(result.current.data).toEqual(expectedResponse)
        )
      })
    })
  })
})

describe('useActivateFlagMeasurements', () => {
  function setup() {
    server.use(
      graphql.mutation('ActivateMeasurements', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data())
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('When success', () => {
      it('returns expected output', async () => {
        const { result } = renderHook(
          () =>
            useActivateFlagMeasurements({
              provider: 'gh',
              owner: 'dancer',
              repo: 'bassuras',
            }),
          {
            wrapper: wrapper(),
          }
        )

        result.current.mutate()

        await waitFor(() => expect(result.current.data).toEqual({}))
      })
    })
  })
})
