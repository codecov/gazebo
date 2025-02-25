import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type MockInstance } from 'vitest'

import { useRepoFlags } from './useRepoFlags'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
    <Route path="/:provider/:owner/:repo/flags">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()
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

const initialData = [
  {
    node: {
      name: 'flag1',
      percentCovered: 93.26,
      percentChange: 1.65,
      measurements: [
        { avg: 91.74637512820512 },
        { avg: 91.85559083333332 },
        { avg: 91.95588104166666 },
        { avg: 91.96796811111112 },
      ],
    },
  },
  {
    node: {
      name: 'flag2',
      percentCovered: 92.72,
      percentChange: 1.58,
      measurements: [
        { avg: 92.44361365466449 },
        { avg: 92.55269245333334 },
        { avg: 92.84718477040816 },
        { avg: 92.91016116666667 },
        { avg: 92.92690138723546 },
      ],
    },
  },
]

const expectedInitialData = [
  {
    name: 'flag1',
    percentCovered: 93.26,
    percentChange: 1.65,

    measurements: [
      { avg: 91.74637512820512 },
      { avg: 91.85559083333332 },
      { avg: 91.95588104166666 },
      { avg: 91.96796811111112 },
    ],
  },
  {
    name: 'flag2',
    percentCovered: 92.72,
    percentChange: 1.58,

    measurements: [
      { avg: 92.44361365466449 },
      { avg: 92.55269245333334 },
      { avg: 92.84718477040816 },
      { avg: 92.91016116666667 },
      { avg: 92.92690138723546 },
    ],
  },
]

const nextPageData = [
  {
    node: {
      name: 'flag3',
      percentCovered: 92.95,
      percentChange: 1.38,
      measurements: [
        { avg: 92.92690138723546 },
        { avg: 92.99535449712643 },
        { avg: 93.13587893358877 },
        { avg: 93.04877792892155 },
        { avg: 93.26297761904759 },
      ],
    },
  },
]

const expectedNextPageData = [
  {
    name: 'flag3',
    percentCovered: 92.95,
    percentChange: 1.38,
    measurements: [
      { avg: 92.92690138723546 },
      { avg: 92.99535449712643 },
      { avg: 93.13587893358877 },
      { avg: 93.04877792892155 },
      { avg: 93.26297761904759 },
    ],
  },
]

describe('FlagMeasurements', () => {
  function setup({
    isSchemaInvalid = false,
    isOwnerActivationError = false,
    isNotFoundError = false,
  } = {}) {
    server.use(
      graphql.query('FlagMeasurements', (info) => {
        if (isSchemaInvalid) {
          return HttpResponse.json({ data: {} })
        }

        if (isOwnerActivationError) {
          return HttpResponse.json({
            data: {
              owner: {
                repository: {
                  __typename: 'OwnerNotActivatedError',
                  message: 'Owner not activated',
                },
              },
            },
          })
        }

        if (isNotFoundError) {
          return HttpResponse.json({
            data: {
              owner: {
                repository: {
                  __typename: 'NotFoundError',
                  message: 'Repo not found',
                },
              },
            },
          })
        }

        const dataReturned = {
          owner: {
            repository: {
              __typename: 'Repository',
              coverageAnalytics: {
                flags: {
                  edges: info.variables.after
                    ? [...nextPageData]
                    : [...initialData],
                  pageInfo: {
                    hasNextPage: !info.variables.after,
                    endCursor: info.variables.after ? 'aabb' : 'dW5pdA==',
                  },
                },
              },
            },
          },
        }
        return HttpResponse.json({ data: dataReturned })
      })
    )
  }

  describe('when called', () => {
    describe('when data is loaded', () => {
      it('returns the data', async () => {
        setup()
        const { result } = renderHook(
          () =>
            useRepoFlags({
              interval: 'INTERVAL_30_DAY',
              afterDate: '2021-09-01',
              beforeDate: '2021-09-30',
            }),
          { wrapper }
        )

        await waitFor(() =>
          expect(result.current.data).toEqual(expectedInitialData)
        )
      })
    })
  })

  describe('when fetchNextPage is called', () => {
    it('returns prev and next page flags data', async () => {
      setup()
      const { result } = renderHook(
        () =>
          useRepoFlags({
            interval: 'INTERVAL_30_DAY',
            afterDate: '2021-09-01',
            beforeDate: '2021-09-30',
          }),
        { wrapper }
      )

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      result.current.fetchNextPage()

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      await waitFor(() =>
        expect(result.current.data).toEqual([
          ...expectedInitialData,
          ...expectedNextPageData,
        ])
      )
    })
  })

  describe('when the schema is invalid', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('returns an error', async () => {
      setup({ isSchemaInvalid: true })
      const { result } = renderHook(
        () =>
          useRepoFlags({
            interval: 'INTERVAL_30_DAY',
            afterDate: '2021-09-01',
            beforeDate: '2021-09-30',
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'useRepoFlags - Parsing Error',
            status: 400,
          })
        )
      )
    })
  })

  describe('when repo is not found', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('returns an error', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          useRepoFlags({
            interval: 'INTERVAL_30_DAY',
            afterDate: '2021-09-01',
            beforeDate: '2021-09-30',
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'useRepoFlags - Not Found Error',
            status: 404,
          })
        )
      )
    })
  })

  describe('when owner is not activated', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('returns an error', async () => {
      setup({ isOwnerActivationError: true })
      const { result } = renderHook(
        () =>
          useRepoFlags({
            interval: 'INTERVAL_30_DAY',
            afterDate: '2021-09-01',
            beforeDate: '2021-09-30',
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'useRepoFlags - Owner Not Activated',
            status: 403,
          })
        )
      )
    })
  })
})
