import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { type MockInstance } from 'vitest'

import { BundleTrendDataQueryOpts } from './BundleTrendDataQueryOpts'

const mockBundleTrendData = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundle: {
                measurements: [
                  {
                    assetType: 'REPORT_SIZE',
                    measurements: [
                      {
                        timestamp: '2024-06-15T00:00:00+00:00',
                        avg: null,
                      },
                      {
                        timestamp: '2024-06-16T00:00:00+00:00',
                        avg: null,
                      },
                      {
                        timestamp: '2024-06-17T00:00:00+00:00',
                        avg: 6834699.8,
                      },
                      {
                        timestamp: '2024-06-18T00:00:00+00:00',
                        avg: 6822037.27273,
                      },
                      {
                        timestamp: '2024-06-19T00:00:00+00:00',
                        avg: 6824833.33333,
                      },
                      {
                        timestamp: '2024-06-20T00:00:00+00:00',
                        avg: 6812341,
                      },
                    ],
                  },
                ],
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
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    {children}
  </QueryClientProviderV5>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
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
  isMissingHeadReport?: boolean
}

describe('useBundleTrendData', () => {
  function setup({
    isMissingHeadReport,
    isNotFoundError,
    isNullOwner,
    isOwnerNotActivatedError,
    isUnsuccessfulParseError,
  }: SetupArgs) {
    server.use(
      graphql.query('GetBundleTrend', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockRepoNotFound })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivated })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else if (isMissingHeadReport) {
          return HttpResponse.json({ data: mockMissingHeadReport })
        }

        return HttpResponse.json({ data: mockBundleTrendData })
      })
    )
  }

  describe('there is valid data', () => {
    it('returns list of measurements', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          useQueryV5(
            BundleTrendDataQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
              bundle: 'test-bundle',
              interval: 'INTERVAL_1_DAY',
              after: new Date('2024-06-15T03:00:00.000Z'),
              before: new Date('2024-06-20T03:00:00.000Z'),
              filters: {
                assetTypes: ['REPORT_SIZE'],
              },
            })
          ),
        { wrapper }
      )

      const expectedResponse = [
        {
          assetType: 'REPORT_SIZE',
          measurements: [
            { timestamp: '2024-06-15T00:00:00+00:00', avg: null },
            { timestamp: '2024-06-16T00:00:00+00:00', avg: null },
            { timestamp: '2024-06-17T00:00:00+00:00', avg: 6834699.8 },
            { timestamp: '2024-06-18T00:00:00+00:00', avg: 6822037.27273 },
            { timestamp: '2024-06-19T00:00:00+00:00', avg: 6824833.33333 },
            { timestamp: '2024-06-20T00:00:00+00:00', avg: 6812341 },
          ],
        },
      ]

      await waitFor(() =>
        expect(result.current.data).toStrictEqual(expectedResponse)
      )
    })
  })

  describe('there is invalid data', () => {
    it('returns an empty array', async () => {
      setup({ isNullOwner: true })
      const { result } = renderHook(
        () =>
          useQueryV5(
            BundleTrendDataQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
              bundle: 'test-bundle',
              interval: 'INTERVAL_1_DAY',
              after: new Date('2024-06-15T03:00:00.000Z'),
              before: new Date('2024-06-20T03:00:00.000Z'),
              filters: {
                assetTypes: ['REPORT_SIZE'],
              },
            })
          ),
        { wrapper }
      )

      await waitFor(() => expect(result.current.data).toStrictEqual([]))
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
            BundleTrendDataQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
              bundle: 'test-bundle',
              interval: 'INTERVAL_1_DAY',
              after: new Date('2024-06-15T03:00:00.000Z'),
              before: new Date('2024-06-20T03:00:00.000Z'),
              filters: {
                assetTypes: ['REPORT_SIZE'],
              },
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
            BundleTrendDataQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
              bundle: 'test-bundle',
              interval: 'INTERVAL_1_DAY',
              after: new Date('2024-06-15T03:00:00.000Z'),
              before: new Date('2024-06-20T03:00:00.000Z'),
              filters: {
                assetTypes: ['REPORT_SIZE'],
              },
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
            BundleTrendDataQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
              bundle: 'test-bundle',
              interval: 'INTERVAL_1_DAY',
              after: new Date('2024-06-15T03:00:00.000Z'),
              before: new Date('2024-06-20T03:00:00.000Z'),
              filters: {
                assetTypes: ['REPORT_SIZE'],
              },
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
