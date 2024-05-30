import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import BackfillBanners from './BackfillBanners'

jest.mock('./TriggerSyncBanner', () => () => 'TriggerSyncBanner')
jest.mock('./SyncingBanner', () => () => 'SyncingBanner')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
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
      graphql.query('BackfillComponentMemberships', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(data))
      )
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
              componentsMeasurementsActive: false,
              componentsMeasurementsBackfilled: true,
              componentsCount: 0,
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
              componentsMeasurementsActive: true,
              componentsMeasurementsBackfilled: false,
              componentsCount: 0,
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
