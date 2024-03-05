import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useCommitBundleList } from './useCommitBundleList'

const mockCommitBundleListData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysisCompareWithParent: {
          __typename: 'BundleAnalysisComparison',
          bundles: [
            {
              name: 'bundle.js',
              changeType: 'added',
              bundleChange: {
                loadTime: {
                  threeG: 3,
                },
                size: {
                  uncompress: 1,
                },
              },
              bundleData: {
                loadTime: {
                  threeG: 4,
                },
                size: {
                  uncompress: 2,
                },
              },
            },
            {
              name: 'bundle.css',
              changeType: 'removed',
              bundleChange: {
                loadTime: {
                  threeG: 7,
                },
                size: {
                  uncompress: 5,
                },
              },
              bundleData: {
                loadTime: {
                  threeG: 8,
                },
                size: {
                  uncompress: 6,
                },
              },
            },
          ],
        },
      },
    },
  },
}

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const mockNotFoundError = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'commit not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
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
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
  isOwnerNotActivatedError?: boolean
  isNotFoundError?: boolean
}

describe('useCommitBundleList', () => {
  function setup({
    isUnsuccessfulParseError = false,
    isNullOwner = false,
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
  }: SetupArgs = {}) {
    server.use(
      graphql.query('CommitBundleList', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else {
          return res(ctx.status(200), ctx.data(mockCommitBundleListData))
        }
      })
    )
  }

  describe('api returns valid response', () => {
    it('returns commit summary data', async () => {
      setup()
      const { result } = renderHook(
        () =>
          useCommitBundleList({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            commitid: 'sha256',
          }),
        { wrapper }
      )

      const expectedResult = {
        commit: {
          bundleAnalysisCompareWithParent: {
            __typename: 'BundleAnalysisComparison',
            bundles: [
              {
                name: 'bundle.js',
                changeType: 'added',
                bundleChange: {
                  loadTime: {
                    threeG: 3,
                  },
                  size: {
                    uncompress: 1,
                  },
                },
                bundleData: {
                  loadTime: {
                    threeG: 4,
                  },
                  size: {
                    uncompress: 2,
                  },
                },
              },
              {
                name: 'bundle.css',
                changeType: 'removed',
                bundleChange: {
                  loadTime: {
                    threeG: 7,
                  },
                  size: {
                    uncompress: 5,
                  },
                },
                bundleData: {
                  loadTime: {
                    threeG: 8,
                  },
                  size: {
                    uncompress: 6,
                  },
                },
              },
            ],
          },
        },
      }

      await waitFor(() =>
        expect(result.current.data).toStrictEqual(expectedResult)
      )
    })
  })

  describe('there is a null owner', () => {
    it('returns a null value', async () => {
      setup({ isNullOwner: true })
      const { result } = renderHook(
        () =>
          useCommitBundleList({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            commitid: 'sha256',
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({ commit: null })
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
          useCommitBundleList({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            commitid: 'sha256',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            data: {},
          })
        )
      )
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
          useCommitBundleList({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            commitid: 'sha256',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            data: {},
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
          useCommitBundleList({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            commitid: 'sha256',
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
})
