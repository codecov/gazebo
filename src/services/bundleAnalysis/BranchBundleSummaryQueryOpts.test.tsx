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

import { BranchBundleSummaryQueryOpts } from './BranchBundleSummaryQueryOpts'

const mockBranchBundleSummary = {
  config: {
    isTimescaleEnabled: true,
  },
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

const mockNullOwner = { config: { isTimescaleEnabled: false }, owner: null }

const mockRepoNotFound = {
  config: { isTimescaleEnabled: false },
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'Repository not found',
    },
  },
}

const mockOwnerNotActivated = {
  config: { isTimescaleEnabled: false },
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'Owner not activated',
    },
  },
}

const server = setupServer()

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
  </QueryClientProviderV5>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  vi.resetAllMocks()
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
      })
    )

    return { passedBranch }
  }

  describe('returns repository typename of repository', () => {
    describe('there is valid data', () => {
      it('returns the bundle summary', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useQueryV5(
              BranchBundleSummaryQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                repo: 'codecov',
                branch: 'main',
              })
            ),
          { wrapper }
        )

        const expectedResponse = {
          config: { isTimescaleEnabled: true },
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
            useQueryV5(
              BranchBundleSummaryQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                repo: 'codecov',
                branch: 'main',
              })
            ),
          { wrapper }
        )

        const expectedResponse = {
          config: { isTimescaleEnabled: false },
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
          useQueryV5(
            BranchBundleSummaryQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
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
            BranchBundleSummaryQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
            })
          ),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'BranchBundleSummaryQueryOpts - Owner Not Activated',
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
            BranchBundleSummaryQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
            })
          ),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'BranchBundleSummaryQueryOpts - Parsing Error',
            status: 400,
          })
        )
      )
    })
  })
})
