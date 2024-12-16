import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { format, sub, subDays, subMonths } from 'date-fns'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React, { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TIME_OPTION_VALUES } from 'pages/RepoPage/shared/constants'

import useRepoComponentsTable from './useRepoComponentsTable'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})

const wrapper =
  (initialEntries = '/gh/codecov/test'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
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

const mocks = vi.hoisted(() => ({
  useLocationParams: vi.fn(),
}))

vi.mock('services/navigation', async () => {
  const actual = await vi.importActual('services/navigation')
  return {
    ...actual,
    useLocationParams: mocks.useLocationParams,
  }
})

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
      isFirstPullRequest: false,
    },
  },
})

const mockedComponentMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        components: [
          {
            name: 'component1',
            componentId: 'component1Id',
            percentCovered: 93.26,
            percentChange: 1.65,
            lastUploaded: null,
            measurements: [],
          },
          {
            name: 'component2',
            componentId: 'component2Id',
            percentCovered: 91.74,
            percentChange: 2.65,
            lastUploaded: null,
            measurements: [],
          },
        ],
      },
    },
  },
}

const mockEmptyComponentMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      components: [],
    },
  },
}

const componentsData = [
  {
    name: 'component1',
    componentId: 'component1Id',
    percentCovered: 93.26,
    percentChange: 1.65,
    measurements: [],
    lastUploaded: null,
  },
  {
    name: 'component2',
    componentId: 'component2Id',
    percentCovered: 91.74,
    percentChange: 2.65,
    measurements: [],
    lastUploaded: null,
  },
]

interface useParamsValueType {
  search?: string
  historicalTrend?: string
  components: string[]
}

describe('useRepoComponentsTable', () => {
  function setup({
    repoData = mockGetRepo,
    noData = false,
    useParamsValue = {
      search: '',
      historicalTrend: TIME_OPTION_VALUES.LAST_3_MONTHS,
      components: [],
    },
  }: {
    repoData?: any
    noData?: boolean
    useParamsValue?: useParamsValueType
  }) {
    mocks.useLocationParams.mockReturnValue({
      params: useParamsValue,
    })

    const requestFilters = vi.fn()

    server.use(
      graphql.query('ComponentMeasurements', (info) => {
        requestFilters(info.variables)
        if (noData) {
          return HttpResponse.json({ data: mockEmptyComponentMeasurements })
        }
        return HttpResponse.json({ data: mockedComponentMeasurements })
      }),
      graphql.query('GetRepo', () => {
        return HttpResponse.json({ data: repoData({}) })
      })
    )

    return { requestFilters }
  }

  it('returns data accordingly', async () => {
    setup({ repoData: mockGetRepo })
    const { result } = renderHook(() => useRepoComponentsTable(), {
      wrapper: wrapper(),
    })
    await waitFor(() => expect(result.current.data).toEqual(componentsData))
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
        useParamsValue: {
          search: '',
          historicalTrend: TIME_OPTION_VALUES.LAST_3_MONTHS,
          components: ['component1'],
        },
      })

      const { result } = renderHook(() => useRepoComponentsTable(true), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.isSearching).toEqual(true))
      await waitFor(() =>
        expect(requestFilters).toHaveBeenCalledWith({
          after: format(sub(new Date(), { months: 3 }), 'yyyy-MM-dd'),
          before: format(new Date(), 'yyyy-MM-dd'),
          filters: {
            components: ['component1'],
          },
          interval: 'INTERVAL_7_DAY',
          orderingDirection: 'DESC',
          name: 'codecov',
          repo: 'test',
        })
      )
    })
  })

  describe('historical trend', () => {
    describe('when historical trend param is empty', () => {
      it('calls useRepoComponentsTable with correct query params', async () => {
        const { requestFilters } = setup({
          repoData: mockGetRepo,
          useParamsValue: {
            components: [],
            historicalTrend: '',
          },
        })

        renderHook(() => useRepoComponentsTable(true), {
          wrapper: wrapper(),
        })

        await waitFor(() =>
          expect(requestFilters).toHaveBeenCalledWith({
            after: format(sub(new Date(), { months: 3 }), 'yyyy-MM-dd'),
            before: format(new Date(), 'yyyy-MM-dd'),
            filters: {},
            interval: 'INTERVAL_7_DAY',
            orderingDirection: 'DESC',
            name: 'codecov',
            repo: 'test',
          })
        )
      })
    })

    describe('when historical trend param is all time', () => {
      it('calls useRepoComponentsTable with correct query params', async () => {
        const { requestFilters } = setup({
          repoData: mockGetRepo,
          useParamsValue: {
            historicalTrend: 'ALL_TIME',
            search: '',
            components: [],
          },
        })

        renderHook(() => useRepoComponentsTable(true), {
          wrapper: wrapper(),
        })

        await waitFor(() =>
          expect(requestFilters).toHaveBeenCalledWith({
            after: '2022-10-10',
            before: format(new Date(), 'yyyy-MM-dd'),
            filters: {},
            interval: 'INTERVAL_30_DAY',
            orderingDirection: 'DESC',
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
          useParamsValue: {
            historicalTrend: 'LAST_6_MONTHS',
            search: '',
            components: [],
          },
        })
        renderHook(() => useRepoComponentsTable(true), {
          wrapper: wrapper(),
        })

        const after = format(subMonths(new Date(), 6), 'yyyy-MM-dd')
        await waitFor(() =>
          expect(requestFilters).toHaveBeenCalledWith({
            after,
            before: format(new Date(), 'yyyy-MM-dd'),
            filters: {},
            interval: 'INTERVAL_7_DAY',
            orderingDirection: 'DESC',
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
          useParamsValue: {
            historicalTrend: 'LAST_7_DAYS',
            search: '',
            components: [],
          },
        })
        renderHook(() => useRepoComponentsTable(true), {
          wrapper: wrapper(),
        })

        const after = format(subDays(new Date(), 7), 'yyyy-MM-dd')
        await waitFor(() =>
          expect(requestFilters).toHaveBeenCalledWith({
            after,
            before: format(new Date(), 'yyyy-MM-dd'),
            filters: {},
            interval: 'INTERVAL_1_DAY',
            orderingDirection: 'DESC',
            name: 'codecov',
            repo: 'test',
          })
        )
      })
    })
  })

  describe('when there is a components param', () => {
    it('calls useRepoComponentsTable with correct filters values', async () => {
      const { requestFilters } = setup({
        repoData: mockGetRepo,
        useParamsValue: { components: ['component1'] },
      })

      renderHook(() => useRepoComponentsTable(true), {
        wrapper: wrapper(),
      })

      await waitFor(() =>
        expect(requestFilters).toHaveBeenCalledWith({
          after: format(sub(new Date(), { months: 3 }), 'yyyy-MM-dd'),
          before: format(new Date(), 'yyyy-MM-dd'),
          filters: { components: ['component1'] },
          interval: 'INTERVAL_7_DAY',
          orderingDirection: 'DESC',
          name: 'codecov',
          repo: 'test',
        })
      )
    })
  })
})
