import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

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
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh/codecov/cool-repo']}>
        <Route path="/:provider/:owner/:repo">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  </QueryClientProviderV5>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  nullFirstVal?: boolean
  isTeamPlan?: boolean
}

describe('useCoverage', () => {
  function setup(
    { nullFirstVal, isTeamPlan }: SetupArgs = {
      nullFirstVal: false,
      isTeamPlan: false,
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
      graphql.query('IsTeamPlan', () => {
        return HttpResponse.json({
          data: { owner: { plan: { isTeamPlan } } },
        })
      })
    )
  }

  it('returns the data formatted correctly', async () => {
    setup()
    const { result } = renderHook(
      () =>
        useCoverage({
          startDate: new Date('2022/01/01'),
          endDate: new Date('2022/01/02'),
          repositories: [],
        }),
      { wrapper }
    )

    await waitFor(() =>
      expect(result.current.data).toStrictEqual([
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
            startDate: new Date('2022/01/01'),
            endDate: new Date('2022/01/02'),
            repositories: [],
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toStrictEqual([
          { coverage: 0, date: new Date('2023-01-01T00:00:00.000Z') },
          { coverage: 80, date: new Date('2023-01-02T00:00:00.000Z') },
        ])
      )
    })
  })

  describe('owner is on a team plan', () => {
    it('gets public repos from useReposCoverageMeasurements', async () => {
      setup({ isTeamPlan: true })
      const { result } = renderHook(
        () =>
          useCoverage({
            startDate: new Date('2022/01/01'),
            endDate: new Date('2022/01/02'),
            repositories: [],
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toStrictEqual([
          { coverage: 80, date: new Date('2023-01-02T00:00:00.000Z') },
        ])
      )
    })
  })
})
