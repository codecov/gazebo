import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import BackfillBanners from './BackfillBanners'

vi.mock('./TriggerSyncBanner', () => ({ default: () => 'TriggerSyncBanner' }))
vi.mock('./SyncingBanner', () => ({ default: () => 'SyncingBanner' }))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
    <Route path="/:provider/:owner/:repo">
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

describe('BackfillBanner', () => {
  function setup(data = {}) {
    server.use(
      graphql.query('BackfillComponentMemberships', (info) => {
        return HttpResponse.json({ data })
      })
    )
  }

  describe('when rendered', () => {
    describe('when components are not backfilled', () => {
      it('displays TriggerSyncBanner component', async () => {
        setup({
          config: {
            isTimescaleEnabled: true,
          },
          owner: {
            repository: {
              __typename: 'Repository',
              coverageAnalytics: {
                componentsMeasurementsActive: false,
                componentsMeasurementsBackfilled: true,
                componentsCount: 0,
              },
            },
          },
        })
        render(<BackfillBanners />, { wrapper })
        const triggerSyncBanner = await screen.findByText(/TriggerSyncBanner/)
        expect(triggerSyncBanner).toBeInTheDocument()
      })
    })
    describe('when components are backfilling', () => {
      it('displays SyncingBanner component', async () => {
        setup({
          config: {
            isTimescaleEnabled: true,
          },
          owner: {
            repository: {
              __typename: 'Repository',
              coverageAnalytics: {
                componentsMeasurementsActive: true,
                componentsMeasurementsBackfilled: false,
                componentsCount: 0,
              },
            },
          },
        })
        render(<BackfillBanners />, { wrapper })
        const syncingBanner = await screen.findByText(/SyncingBanner/)
        expect(syncingBanner).toBeInTheDocument()
      })
    })
  })
})
