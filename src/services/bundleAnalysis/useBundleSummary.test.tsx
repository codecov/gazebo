import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { type MockInstance } from 'vitest'

import { BundleSummaryQueryOpts, useBundleSummary } from './useBundleSummary'

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

const mockBundleSummary = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundle: {
                name: 'bundle1',
                moduleCount: 10,
                bundleData: {
                  loadTime: { threeG: 1000, highSpeed: 500 },
                  size: { gzip: 1000, uncompress: 2000 },
                },
              },
            },
          },
        },
      },
    },
  },
}

const mockMissingHeadReport = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'MissingHeadReport',
              message: 'Missing head report',
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
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div>Loading</div>}>{children}</Suspense>
    </QueryClientProvider>
  </QueryClientProviderV5>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  vi.clearAllMocks()
  queryClient.clear()
  queryClientV5.clear()
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
  missingHeadReport?: boolean
}

describe('useBundleSummary', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
    missingHeadReport = false,
  }: SetupArgs) {
    const passedBranch = vi.fn()

    server.use(
      graphql.query('BundleSummary', (info) => {
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
        } else if (missingHeadReport) {
          return HttpResponse.json({ data: mockMissingHeadReport })
        }

        return HttpResponse.json({ data: mockBundleSummary })
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
          useBundleSummary({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
          }),
        { wrapper }
      )

      await waitFor(() => expect(passedBranch).toHaveBeenCalled())
      await waitFor(() => expect(passedBranch).toHaveBeenCalledWith('main'))
    })
  })

  describe('no branch name passed', () => {
    it('uses the default branch', async () => {
      const { passedBranch } = setup({})
      renderHook(
        () =>
          useBundleSummary({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            bundle: 'test-bundle',
          }),
        { wrapper }
      )

      await waitFor(() => expect(passedBranch).toHaveBeenCalled())
      await waitFor(() => expect(passedBranch).toHaveBeenCalledWith('main'))
    })
  })

  describe('returns repository typename of repository', () => {
    describe('there is valid data', () => {
      describe('there is a bundle report', () => {
        it('returns the bundle summary', async () => {
          setup({})
          const { result } = renderHook(
            () =>
              useBundleSummary({
                provider: 'gh',
                owner: 'codecov',
                repo: 'codecov',
                branch: 'main',
                bundle: 'test-bundle',
              }),
            { wrapper }
          )

          const expectedResponse = {
            bundleSummary: {
              name: 'bundle1',
              moduleCount: 10,
              bundleData: {
                loadTime: {
                  highSpeed: 500,
                  threeG: 1000,
                },
                size: {
                  gzip: 1000,
                  uncompress: 2000,
                },
              },
            },
          }

          await waitFor(() =>
            expect(result.current.data).toStrictEqual(expectedResponse)
          )
        })
      })

      describe('there is a missing head report', () => {
        it('returns null', async () => {
          setup({ missingHeadReport: true })
          const { result } = renderHook(
            () =>
              useBundleSummary({
                provider: 'gh',
                owner: 'codecov',
                repo: 'codecov',
                branch: 'main',
                bundle: 'test-bundle',
              }),
            { wrapper }
          )

          const expectedResponse = {
            bundleSummary: null,
          }

          await waitFor(() =>
            expect(result.current.data).toStrictEqual(expectedResponse)
          )
        })
      })
    })

    describe('there is invalid data', () => {
      it('returns a null value', async () => {
        setup({ isNullOwner: true })
        const { result } = renderHook(
          () =>
            useBundleSummary({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
              bundle: 'test-bundle',
            }),
          { wrapper }
        )

        const expectedResponse = {
          bundleSummary: null,
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
          useQueryV5(
            BundleSummaryQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
              bundle: 'test-bundle',
            })
          ),
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
          useQueryV5(
            BundleSummaryQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
              bundle: 'test-bundle',
            })
          ),
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
          useQueryV5(
            BundleSummaryQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
              bundle: 'test-bundle',
            })
          ),
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
