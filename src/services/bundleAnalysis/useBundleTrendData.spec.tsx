import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useBundleTrendData } from './useBundleTrendData'

const mockBundleTrendData = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
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
}

const mockMissingHeadReport = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysisReport: {
            __typename: 'MissingHeadReport',
            message: 'Missing head report',
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
      graphql.query('GetBundleTrend', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockRepoNotFound))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivated))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else if (isMissingHeadReport) {
          return res(ctx.status(200), ctx.data(mockMissingHeadReport))
        }

        return res(ctx.status(200), ctx.data(mockBundleTrendData))
      })
    )
  }

  describe('there is valid data', () => {
    it('returns list of measurements', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          useBundleTrendData({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
            interval: 'INTERVAL_1_DAY',
            after: '2024-06-15T03:00:00.000Z',
            before: '2024-06-20T03:00:00.000Z',
            filters: {
              assetTypes: ['REPORT_SIZE'],
            },
          }),
        { wrapper }
      )

      const expectedResponse = [
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
          useBundleTrendData({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
            interval: 'INTERVAL_1_DAY',
            after: '2024-06-15T03:00:00.000Z',
            before: '2024-06-20T03:00:00.000Z',
            filters: {
              assetTypes: ['REPORT_SIZE'],
            },
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.data).toStrictEqual([]))
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
          useBundleTrendData({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
            interval: 'INTERVAL_1_DAY',
            after: '2024-06-15T03:00:00.000Z',
            before: '2024-06-20T03:00:00.000Z',
            filters: {
              assetTypes: ['REPORT_SIZE'],
            },
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
          useBundleTrendData({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
            interval: 'INTERVAL_1_DAY',
            after: '2024-06-15T03:00:00.000Z',
            before: '2024-06-20T03:00:00.000Z',
            filters: {
              assetTypes: ['REPORT_SIZE'],
            },
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
          useBundleTrendData({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
            interval: 'INTERVAL_1_DAY',
            after: '2024-06-15T03:00:00.000Z',
            before: '2024-06-20T03:00:00.000Z',
            filters: {
              assetTypes: ['REPORT_SIZE'],
            },
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
