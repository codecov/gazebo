import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import {
  useEraseRepoContent,
  useRepo,
  useRepoBackfilled,
  useUpdateRepo,
} from './index'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = '/gh/codecov/test'): React.FC<React.PropsWithChildren> =>
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
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

const provider = 'gh'
const owner = 'cool-guy'
const repo = 'cool-repo'

describe('useRepo', () => {
  function setup(apiData: any) {
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

    beforeAll(() => {
      console.error = () => {}
    })

    afterAll(() => {
      jest.resetAllMocks()
    })

    describe('when incorrect data is loaded', () => {
      it('throws an error', async () => {
        setup(badData)
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
          isFirstPullRequest: false,
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
            isFirstPullRequest: false,
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
      graphql.mutation('EraseRepository', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            eraseRepository: {
              data: null,
            },
          })
        )
      })
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

        result.current.mutate()

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

        // @ts-expect-error
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
        __typename: 'Repository',
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: true,
      },
    },
  }

  const mockUnsuccessfulParseError = {}

  const mockRepoNotFound = {
    owner: {
      repository: {
        __typename: 'NotFoundError',
        message: 'Repository not found',
      },
    },
  }

  const mockOwnerNotActivated = {
    owner: {
      repository: {
        __typename: 'OwnerNotActivatedError',
        message: 'Owner not activated',
      },
    },
  }

  interface SetupArgs {
    isNotFoundError?: boolean
    isOwnerNotActivatedError?: boolean
    isUnsuccessfulParseError?: boolean
  }

  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
  }: SetupArgs) {
    server.use(
      graphql.query('BackfillFlagMemberships', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockRepoNotFound))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivated))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else {
          return res(ctx.status(200), ctx.data(dataReturned))
        }
      })
    )
  }

  describe('when called', () => {
    describe('when data is loaded', () => {
      it('returns the data', async () => {
        setup({})
        const { result } = renderHook(() => useRepoBackfilled(), {
          wrapper: wrapper(),
        })

        const expectedResponse = {
          __typename: 'Repository',
          flagsMeasurementsActive: true,
          flagsMeasurementsBackfilled: true,
        }
        await waitFor(() =>
          expect(result.current.data).toEqual(expectedResponse)
        )
      })
    })

    describe('can throw errors', () => {
      beforeAll(() => {
        console.error = () => {}
      })

      afterAll(() => {
        jest.resetAllMocks()
      })
      it('can return unsuccessful parse error', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(() => useRepoBackfilled(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
            })
          )
        )
      })
      it('can return not found error', async () => {
        setup({ isNotFoundError: true })
        const { result } = renderHook(() => useRepoBackfilled(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
            })
          )
        )
      })
      it('can return owner not activated error', async () => {
        setup({ isOwnerNotActivatedError: true })
        const { result } = renderHook(() => useRepoBackfilled(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 403,
            })
          )
        )
      })
    })
  })
})
