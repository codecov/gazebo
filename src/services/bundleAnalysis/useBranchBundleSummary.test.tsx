import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { type MockInstance } from 'vitest'

import { useBranchBundleSummary } from './useBranchBundleSummary'

const mockRepoOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: false,
      bundleAnalysisEnabled: false,
      languages: ['javascript'],
      testAnalyticsEnabled: true,
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
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundleData: {
                loadTime: { threeG: 200 },
                size: { uncompress: 100 },
              },
              bundles: [
                {
                  name: 'bundle1',
                  bundleData: {
                    loadTime: { threeG: 100 },
                    size: { uncompress: 50 },
                  },
                },
              ],
            },
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
  vi.resetAllMocks()
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
    const passedBranch = vi.fn()

    server.use(
      graphql.query('BranchBundleSummaryData', (info) => {
        if (info.variables?.branch) {
          passedBranch(info.variables?.branch)
        }

        if (isNotFoundError) {
          return HttpResponse.json({ data: mockRepoNotFound })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivated })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        }

        return HttpResponse.json({ data: mockBranchBundleSummary })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockRepoOverview })
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
              bundleAnalysis: {
                bundleAnalysisReport: {
                  __typename: 'BundleAnalysisReport',
                  bundleData: {
                    loadTime: { threeG: 200 },
                    size: { uncompress: 100 },
                  },
                  bundles: [
                    {
                      name: 'bundle1',
                      bundleData: {
                        loadTime: { threeG: 100 },
                        size: { uncompress: 50 },
                      },
                    },
                  ],
                },
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
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
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
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
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
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
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
