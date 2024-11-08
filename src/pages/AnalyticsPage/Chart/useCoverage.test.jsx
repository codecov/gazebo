import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import { useCoverage } from './useCoverage'

vi.mock('services/charts')

const mockRepoMeasurements = {
  owner: {
    measurements: [
      { timestamp: '2023-01-01T00:00:00+00:00', avg: 85 },
      { timestamp: '2023-01-02T00:00:00+00:00', avg: 80 },
      { timestamp: '2023-01-02T00:00:00+00:00', avg: null },
      { timestamp: '2023-01-03T00:00:00+00:00', avg: 80 },
      { timestamp: '2023-01-04T00:00:00+00:00', avg: 95 },
    ],
  },
}

const mockNullFirstValRepoMeasurements = {
  owner: {
    measurements: [
      { timestamp: '2023-01-01T00:00:00+00:00', avg: null },
      { timestamp: '2023-01-02T00:00:00+00:00', avg: 80 },
    ],
  },
}

const mockPublicRepoMeasurements = {
  owner: {
    measurements: [{ timestamp: '2023-01-02T00:00:00+00:00', avg: 80 }],
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
})

describe('useCoverage', () => {
  function setup(
    { nullFirstVal, tierValue } = {
      nullFirstVal: false,
      tierValue: TierNames.PRO,
    }
  ) {
    server.use(
      graphql.query('GetReposCoverageMeasurements', (info) => {
        if (info.variables?.isPublic) {
          return HttpResponse.json({ data: mockPublicRepoMeasurements })
        }
        if (nullFirstVal) {
          return HttpResponse.json({ data: mockNullFirstValRepoMeasurements })
        }
        return HttpResponse.json({ data: mockRepoMeasurements })
      }),
      graphql.query('OwnerTier', (info) => {
        return HttpResponse.json({
          data: { owner: { plan: { tierName: tierValue } } },
        })
      })
    )
  }

  it('returns the data formatted correctly', async () => {
    setup()
    const { result } = renderHook(
      () =>
        useCoverage({
          params: {
            startDate: new Date('2022/01/01'),
            endDate: new Date('2022/01/02'),
          },
        }),
      { wrapper }
    )

    await waitFor(() =>
      expect(result.current.data?.coverage).toStrictEqual([
        { coverage: 85, date: new Date('2023-01-01T00:00:00.000Z') },
        { coverage: 80, date: new Date('2023-01-02T00:00:00.000Z') },
        { coverage: 80, date: new Date('2023-01-02T00:00:00.000Z') },
        { coverage: 80, date: new Date('2023-01-03T00:00:00.000Z') },
        { coverage: 95, date: new Date('2023-01-04T00:00:00.000Z') },
      ])
    )
  })

  describe('first value is null', () => {
    it('resets value to zero', async () => {
      setup({ nullFirstVal: true })
      const { result } = renderHook(
        () =>
          useCoverage({
            params: {
              startDate: new Date('2022/01/01'),
              endDate: new Date('2022/01/02'),
            },
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data?.coverage).toStrictEqual([
          { coverage: 0, date: new Date('2023-01-01T00:00:00.000Z') },
          { coverage: 80, date: new Date('2023-01-02T00:00:00.000Z') },
        ])
      )
    })
  })

  describe('coverage axis label', () => {
    it('returns the right format for days', async () => {
      setup()
      const { result } = renderHook(
        () =>
          useCoverage({
            params: {
              startDate: new Date('2022/01/01'),
              endDate: new Date('2022/01/10'),
            },
          }),
        { wrapper }
      )

      await waitFor(() => !!result.current.data.coverageAxisLabel)
      const coverageAxisLabel = result.current.data.coverageAxisLabel

      const message = coverageAxisLabel(new Date('2022/01/01'))
      expect(message).toBe('Jan 1, 22')
    })

    it('returns the right format for weeks', async () => {
      setup()
      const { result } = renderHook(
        () =>
          useCoverage({
            params: {
              startDate: new Date('2022/01/01'),
              endDate: new Date('2022/10/01'),
            },
          }),
        { wrapper }
      )

      await waitFor(() => !!result.current.data.coverageAxisLabel)
      const coverageAxisLabel = result.current.data.coverageAxisLabel

      const message = coverageAxisLabel(new Date('2022/01/01'))
      expect(message).toBe('Jan 1, 22')
    })

    it('returns the right format for default', async () => {
      setup()
      const { result } = renderHook(
        () =>
          useCoverage({
            params: {
              startDate: new Date('2022/01/01'),
              endDate: new Date('2023/10/01'),
            },
          }),
        { wrapper }
      )

      await waitFor(() => !!result.current.data.coverageAxisLabel)
      const coverageAxisLabel = result.current.data.coverageAxisLabel

      const message = coverageAxisLabel(new Date('2022/01/01'))
      expect(message).toBe('Jan 2022')
    })
  })

  describe('select', () => {
    it('calls select', async () => {
      let selectMock = vi.fn()
      setup()
      renderHook(
        () =>
          useCoverage({
            params: {
              startDate: new Date('2022/01/01'),
              endDate: new Date('2022/01/02'),
            },
            options: { select: selectMock },
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => expect(selectMock).toHaveBeenCalled())
    })
  })

  describe('owner is on a team plan', () => {
    it('gets public repos from useReposCoverageMeasurements', async () => {
      setup({ tierValue: TierNames.TEAM })
      const { result } = renderHook(
        () =>
          useCoverage({
            params: {
              startDate: new Date('2022/01/01'),
              endDate: new Date('2022/01/02'),
            },
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data?.coverage).toStrictEqual([
          { coverage: 80, date: new Date('2023-01-02T00:00:00.000Z') },
        ])
      )
    })
  })
})
