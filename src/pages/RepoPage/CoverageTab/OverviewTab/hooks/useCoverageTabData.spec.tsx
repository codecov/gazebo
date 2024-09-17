import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCoverageTabData } from './useCoverageTabData'

const mockOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: ['JavaScript'],
      testAnalyticsEnabled: true,
    },
  },
}

const mockCoverageTabData = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          totals: {
            fileCount: 10,
            lineCount: 100,
          },
        },
      },
    },
  },
}

const mockNotFoundError = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'NotFoundError',
      message: 'commit not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (
    initialEntries = '/gh/codecov/cool-repo'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/tree/:branch',
            '/:provider/:owner/:repo',
          ]}
        >
          {children}
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
}

describe('useCoverageTabData', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('CoverageTabData', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else {
          return res(ctx.status(200), ctx.data(mockCoverageTabData))
        }
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockOverview))
      })
    )
  }

  describe('valid data response', () => {
    describe('branch is passed', () => {
      it('returns the data for the passed branch', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useCoverageTabData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              branch: 'main',
            }),
          { wrapper: wrapper() }
        )

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
        await waitFor(() =>
          expect(result.current.data).toEqual({
            branch: {
              head: {
                totals: {
                  fileCount: 10,
                  lineCount: 100,
                },
              },
            },
          })
        )
      })
    })

    describe('branch is not passed', () => {
      it('returns the data for the default branch', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useCoverageTabData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
            }),
          { wrapper: wrapper() }
        )

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
        await waitFor(() =>
          expect(result.current.data).toEqual({
            branch: {
              head: {
                totals: {
                  fileCount: 10,
                  lineCount: 100,
                },
              },
            },
          })
        )
      })
    })
  })

  describe('returns NotFoundError __typename', () => {
    let oldConsoleError = console.error

    beforeEach(() => {
      console.error = () => null
    })

    afterEach(() => {
      console.error = oldConsoleError
    })

    it('throws a 404', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          useCoverageTabData({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
            branch: 'main',
          }),
        { wrapper: wrapper() }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useCoverageTabData - 404 NotFoundError',
          })
        )
      )
    })
  })

  describe('returns OwnerNotActivatedError __typename', () => {
    let oldConsoleError = console.error

    beforeEach(() => {
      console.error = () => null
    })

    afterEach(() => {
      console.error = oldConsoleError
    })

    it('throws a 403', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          useCoverageTabData({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
            branch: 'main',
          }),
        { wrapper: wrapper() }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 403,
            dev: 'useCoverageTabData - 403 OwnerNotActivatedError',
          })
        )
      )
    })
  })

  describe('unsuccessful parse of zod schema', () => {
    let oldConsoleError = console.error

    beforeEach(() => {
      console.error = () => null
    })

    afterEach(() => {
      console.error = oldConsoleError
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          useCoverageTabData({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
            branch: 'main',
          }),
        { wrapper: wrapper() }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useCoverageTabData - 404 schema parsing failed',
          })
        )
      )
    })
  })
})
