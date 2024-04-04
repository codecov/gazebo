import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { format, subDays, subMonths } from 'date-fns'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'

import useRepoComponentsTable from './useRepoComponentsTable'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})

const wrapper =
  (initialEntries = '/gh/codecov/test') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner/:repo">
          <QueryClientProvider client={queryClient}>
            <Suspense fallback={null}>{children}</Suspense>
          </QueryClientProvider>
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

jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))

const mockGetRepo = ({
  noUploadToken = false,
  isRepoPrivate = false,
  isRepoActivated = true,
  isCurrentUserPartOfOrg = true,
  isRepoActive = true,
  isCurrentUserActivated = true,
}) => ({
  owner: {
    isAdmin: true,
    isCurrentUserPartOfOrg,
    isCurrentUserActivated,
    repository: {
      __typename: 'Repository',
      private: isRepoPrivate,
      uploadToken: noUploadToken
        ? null
        : '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: isRepoActivated,
      oldestCommitAt: '2022-10-10T11:59:59',
      active: isRepoActive,
    },
  },
})

const mockFlagMeasurements = (after) => {
  return {
    owner: {
      repository: {
        __typename: 'Repository',
        flags: {
          edges: after
            ? []
            : [
                {
                  node: {
                    name: 'flag1',
                    percentCovered: 93.26,
                    percentChange: 1.65,
                    measurements: [],
                  },
                },
                {
                  node: {
                    name: 'flag2',
                    percentCovered: 91.74,
                    percentChange: 2.65,
                    measurements: [],
                  },
                },
              ],
          pageInfo: {
            hasNextPage: after ? false : true,
            endCursor: after
              ? 'aa'
              : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
          },
        },
      },
    },
  }
}

const mockEmptyFlagMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      flags: {
        edges: false ? [] : [],
        pageInfo: {
          hasNextPage: false,
          endCursor: true ? 'aa' : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
        },
      },
    },
  },
}

const componentsData = [
  {
    name: 'flag1',
    percentCovered: 93.26,
    percentChange: 1.65,
    measurements: [],
  },
  {
    name: 'flag2',
    percentCovered: 91.74,
    percentChange: 2.65,
    measurements: [],
  },
]

describe('useRepoComponentsTable', () => {
  function setup({
    repoData = mockGetRepo,
    noData = false,
    useParamsValue = { search: '', historicalTrend: '', flags: [] },
  }) {
    useLocationParams.mockReturnValue({
      params: useParamsValue,
    })

    const requestFilters = jest.fn()

    server.use(
      graphql.query('FlagMeasurements', (req, res, ctx) => {
        requestFilters(req.variables)
        if (req?.variables?.after) {
          return res(ctx.status(200), ctx.data(mockFlagMeasurements(true)))
        }
        if (noData) {
          return res(ctx.status(200), ctx.data(mockEmptyFlagMeasurements))
        }
        return res(ctx.status(200), ctx.data(mockFlagMeasurements(false)))
      }),
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(repoData({})))
      )
    )

    return { requestFilters }
  }

  it('returns data accordingly', async () => {
    setup({ repoData: mockGetRepo })
    const { result } = renderHook(() => useRepoComponentsTable(), {
      wrapper: wrapper(),
    })
    await waitFor(() => expect(result.current.data).toEqual(componentsData))
    await waitFor(() => expect(result.current.isLoading).toEqual(false))
    await waitFor(() => expect(result.current.hasNextPage).toEqual(true))
    await waitFor(() =>
      expect(result.current.isFetchingNextPage).toEqual(false)
    )
  })

  describe('when there is no data', () => {
    it('returns an empty array', async () => {
      setup({ repoData: mockGetRepo, noData: true })
      const { result } = renderHook(() => useRepoComponentsTable(), {
        wrapper: wrapper(),
      })
      await waitFor(() => expect(result.current.data).toEqual([]))
    })
  })

  describe('when there is search param', () => {
    it('calls useRepoComponentsTable with correct filters value', async () => {
      const { requestFilters } = setup({
        repoData: mockGetRepo,
        noData: true,
        useParamsValue: { search: 'flag1' },
      })

      const { result } = renderHook(() => useRepoComponentsTable(true), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.isSearching).toEqual(true))
      await waitFor(() =>
        expect(requestFilters).toHaveBeenCalledWith({
          afterDate: '2022-10-10',
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: 'flag1' },
          interval: 'INTERVAL_30_DAY',
          orderingDirection: 'ASC',
          name: 'codecov',
          repo: 'test',
        })
      )
    })
  })

  describe('historical trend', () => {
    describe('when historical trend param is empty or all time is selected', () => {
      it('calls useRepoComponentsTable with correct query params', async () => {
        const { requestFilters } = setup({
          repoData: mockGetRepo,
        })

        renderHook(() => useRepoComponentsTable(true), {
          wrapper: wrapper(),
        })

        await waitFor(() =>
          expect(requestFilters).toHaveBeenCalledWith({
            afterDate: '2022-10-10',
            beforeDate: format(new Date(), 'yyyy-MM-dd'),
            filters: { term: '', flagsNames: [] },
            interval: 'INTERVAL_30_DAY',
            orderingDirection: 'ASC',
            name: 'codecov',
            repo: 'test',
          })
        )
      })
    })

    describe('when 6 months is selected', () => {
      it('calls useRepoComponentsTable with correct query params', async () => {
        const { requestFilters } = setup({
          repoData: mockGetRepo,
          useParamsValue: { historicalTrend: 'LAST_6_MONTHS', search: '' },
        })
        renderHook(() => useRepoComponentsTable(true), {
          wrapper: wrapper(),
        })

        const afterDate = format(subMonths(new Date(), 6), 'yyyy-MM-dd')
        await waitFor(() =>
          expect(requestFilters).toHaveBeenCalledWith({
            afterDate,
            beforeDate: format(new Date(), 'yyyy-MM-dd'),
            filters: { term: '' },
            interval: 'INTERVAL_7_DAY',
            orderingDirection: 'ASC',
            name: 'codecov',
            repo: 'test',
          })
        )
      })
    })

    describe('when last 7 days is selected', () => {
      it('calls useRepoComponentsTable with correct query params', async () => {
        const { requestFilters } = setup({
          repoData: mockGetRepo,
          useParamsValue: { historicalTrend: 'LAST_7_DAYS', search: '' },
        })
        renderHook(() => useRepoComponentsTable(true), {
          wrapper: wrapper(),
        })

        const afterDate = format(subDays(new Date(), 7), 'yyyy-MM-dd')
        await waitFor(() =>
          expect(requestFilters).toHaveBeenCalledWith({
            afterDate,
            beforeDate: format(new Date(), 'yyyy-MM-dd'),
            filters: { term: '' },
            interval: 'INTERVAL_1_DAY',
            orderingDirection: 'ASC',
            name: 'codecov',
            repo: 'test',
          })
        )
      })
    })
  })

  describe('when there is a flags param', () => {
    it('calls useRepoComponentsTable with correct filters values', async () => {
      const { requestFilters } = setup({
        repoData: mockGetRepo,
        useParamsValue: { flags: ['flag1'] },
      })

      renderHook(() => useRepoComponentsTable(true), {
        wrapper: wrapper(),
      })

      await waitFor(() =>
        expect(requestFilters).toHaveBeenCalledWith({
          afterDate: '2022-10-10',
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { flagsNames: ['flag1'] },
          interval: 'INTERVAL_30_DAY',
          orderingDirection: 'ASC',
          name: 'codecov',
          repo: 'test',
        })
      )
    })
  })
})
