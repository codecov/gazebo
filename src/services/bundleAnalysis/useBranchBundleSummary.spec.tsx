import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useBranchBundleSummary } from './useBranchBundleSummary'

const mockRepoOverview = {
  owner: {
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: false,
      bundleAnalysisEnabled: false,
      languages: ['javascript'],
    },
  },
}

const mockBranchBundleSummary = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          commitid: '543a5268dce725d85be7747c0f9b61e9a68dea57',
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            sizeTotal: 100,
            loadTimeTotal: 200,
            bundles: [{ name: 'bundle1', sizeTotal: 50, loadTimeTotal: 100 }],
          },
        },
      },
    },
  },
}

const mockUnsuccessfulParseError = {}

const mockNullOwner = { owner: null }

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

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  jest.resetAllMocks()
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

describe('useBranchBundleSummary', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    const passedBranch = jest.fn()

    server.use(
      graphql.query('BranchBundleSummaryData', (req, res, ctx) => {
        if (req.variables?.branch) {
          passedBranch(req.variables?.branch)
        }

        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockRepoNotFound))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivated))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        }

        return res(ctx.status(200), ctx.data(mockBranchBundleSummary))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoOverview))
      })
    )

    return { passedBranch }
  }

  describe('passing branch name', () => {
    it('uses the branch name passed in', async () => {
      const { passedBranch } = setup({})
      renderHook(
        () =>
          useBranchBundleSummary({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'cool-branch',
          }),
        { wrapper }
      )

      await waitFor(() => expect(passedBranch).toHaveBeenCalled())
      await waitFor(() =>
        expect(passedBranch).toHaveBeenCalledWith('cool-branch')
      )
    })
  })

  describe('no branch name passed', () => {
    it('uses the default branch', async () => {
      const { passedBranch } = setup({})
      renderHook(
        () =>
          useBranchBundleSummary({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
          }),
        { wrapper }
      )

      await waitFor(() => expect(passedBranch).toHaveBeenCalled())
      await waitFor(() => expect(passedBranch).toHaveBeenCalledWith('main'))
    })
  })

  describe('returns repository typename of repository', () => {
    describe('there is valid data', () => {
      it('returns the bundle summary', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useBranchBundleSummary({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
            }),
          { wrapper }
        )

        const expectedResponse = {
          branch: {
            head: {
              commitid: '543a5268dce725d85be7747c0f9b61e9a68dea57',
              bundleAnalysisReport: {
                __typename: 'BundleAnalysisReport',
                sizeTotal: 100,
                loadTimeTotal: 200,
                bundles: [
                  { name: 'bundle1', sizeTotal: 50, loadTimeTotal: 100 },
                ],
              },
            },
          },
        }

        await waitFor(() =>
          expect(result.current.data).toStrictEqual(expectedResponse)
        )
      })
    })

    describe('there is invalid data', () => {
      it('returns a null value', async () => {
        setup({ isNullOwner: true })
        const { result } = renderHook(
          () =>
            useBranchBundleSummary({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
            }),
          { wrapper }
        )

        const expectedResponse = {
          branch: null,
        }

        await waitFor(() =>
          expect(result.current.data).toStrictEqual(expectedResponse)
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
          useBranchBundleSummary({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
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
          useBranchBundleSummary({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
          }),
        { wrapper }
      )

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
          useBranchBundleSummary({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
          })
        )
      )
    })
  })
})
