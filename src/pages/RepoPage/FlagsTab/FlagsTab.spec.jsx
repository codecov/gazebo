import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoBackfilled, useRepoFlagsSelect } from 'services/repo'
import { TierNames } from 'services/tier'

import FlagsTab from './FlagsTab'

jest.mock('services/repo/useRepoBackfilled')
jest.mock('services/repo/useRepoFlagsSelect')
jest.mock('shared/featureFlags')

jest.mock(
  './BackfillBanners/TriggerSyncBanner/TriggerSyncBanner.jsx',
  () => () => 'Trigger Sync Banner'
)
jest.mock(
  './BackfillBanners/SyncingBanner/SyncingBanner.jsx',
  () => () => 'Syncing Banner'
)
jest.mock('./subroute/FlagsTable/FlagsTable', () => () => 'Flags table')
jest.mock('./Header', () => ({ children }) => (
  <p>Flags Header Component {children}</p>
))

const flagsData = [
  {
    name: 'flag1',
  },
  {
    name: 'flag2',
  },
]

const server = setupServer()
const queryClient = new QueryClient()
let testLocation = {
  pathname: '',
}

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
      <Route path="/:provider/:owner/:repo/flags">{children}</Route>
      <Route
        path="*"
        render={({ location }) => {
          testLocation.pathname = location.pathname
          return null
        }}
      />
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  console.error = () => {}
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('Flags Tab', () => {
  function setup({ data = {}, flags = flagsData, tierValue = TierNames.PRO }) {
    useRepoFlagsSelect.mockReturnValue({ data: flags })
    useRepoBackfilled.mockReturnValue(data)

    server.use(
      graphql.query('OwnerTier', (req, res, ctx) => {
        if (tierValue === TierNames.TEAM) {
          return res(
            ctx.status(200),
            ctx.data({ owner: { plan: { tierName: TierNames.TEAM } } })
          )
        }
        return res(
          ctx.status(200),
          ctx.data({ owner: { plan: { tierName: TierNames.PRO } } })
        )
      })
    )
  }

  describe('when user has a team tier', () => {
    beforeEach(() => {
      setup({ tierValue: TierNames.TEAM })
    })

    it('redirects to the coverage tab', async () => {
      render(<FlagsTab />, { wrapper })

      await waitFor(() =>
        expect(testLocation.pathname).toBe('/gh/codecov/gazebo')
      )
    })
  })

  describe('when rendered without active or backfilled repo', () => {
    beforeEach(() => {
      setup({
        data: {
          data: {
            flagsMeasurementsActive: false,
            flagsMeasurementsBackfilled: false,
            isTimescaleEnabled: true,
          },
        },
      })
    })

    it('renders header', async () => {
      render(<FlagsTab />, { wrapper })

      const header = await screen.findByText(/Flags Header Component/)
      expect(header).toBeInTheDocument()
    })

    it('renders trigger sync banner', async () => {
      render(<FlagsTab />, { wrapper })

      const triggerSyncBanner = await screen.findByText(/Trigger Sync Banner/)
      expect(triggerSyncBanner).toBeInTheDocument()
    })

    it('does not render trigger sync banner', () => {
      render(<FlagsTab />, { wrapper })

      const syncingBanner = screen.queryByText(/Syncing Banner/)
      expect(syncingBanner).not.toBeInTheDocument()
    })

    it('renders a blurred image of the table', async () => {
      render(<FlagsTab />, { wrapper })
      const blurredFlagsTableImage = await screen.findByRole('img', {
        name: /Blurred flags table/,
      })
      expect(blurredFlagsTableImage).toBeInTheDocument()
    })
  })

  describe('when rendered while ongoing syncing', () => {
    beforeEach(() => {
      setup({
        data: {
          data: {
            flagsMeasurementsActive: true,
            flagsMeasurementsBackfilled: false,
            isTimescaleEnabled: true,
          },
        },
      })
    })

    it('renders header', async () => {
      render(<FlagsTab />, { wrapper })

      const header = await screen.findByText(/Flags Header Component/)
      expect(header).toBeInTheDocument()
    })

    it('renders trigger sync banner', () => {
      render(<FlagsTab />, { wrapper })

      const triggerSyncBanner = screen.queryByText(/Trigger Sync Banner/)
      expect(triggerSyncBanner).not.toBeInTheDocument()
    })

    it('does not render trigger sync banner', async () => {
      render(<FlagsTab />, { wrapper })

      const syncingBanner = await screen.findByText(/Syncing Banner/)
      expect(syncingBanner).toBeInTheDocument()
    })

    it('renders a blurred image of the table', async () => {
      render(<FlagsTab />, { wrapper })
      const blurredFlagsTableImage = await screen.findByRole('img', {
        name: /Blurred flags table/,
      })
      expect(blurredFlagsTableImage).toBeInTheDocument()
    })
  })

  describe('when rendered with backfilled repo', () => {
    beforeEach(() => {
      setup({
        data: {
          data: {
            flagsMeasurementsActive: true,
            flagsMeasurementsBackfilled: true,
            isTimescaleEnabled: true,
          },
        },
      })
    })

    it('renders header', async () => {
      render(<FlagsTab />, { wrapper })

      const header = await screen.findByText(/Flags Header Component/)
      expect(header).toBeInTheDocument()
    })

    it('renders trigger sync banner', () => {
      render(<FlagsTab />, { wrapper })

      const triggerSyncBanner = screen.queryByText(/Trigger Sync Banner/)
      expect(triggerSyncBanner).not.toBeInTheDocument()
    })

    it('does not render trigger sync banner', () => {
      render(<FlagsTab />, { wrapper })

      const syncingBanner = screen.queryByText(/Syncing Banner/)
      expect(syncingBanner).not.toBeInTheDocument()
    })
  })

  describe('when rendered with no flags', () => {
    beforeEach(() => {
      setup({
        data: {
          data: {
            flagsMeasurementsActive: false,
            flagsMeasurementsBackfilled: false,
            isTimescaleEnabled: true,
          },
        },
        flags: [],
      })
    })

    it('renders empty state message', async () => {
      render(<FlagsTab />, { wrapper })
      const flagsText = await screen.findByText(
        /The Flags feature is not yet configured/
      )
      expect(flagsText).toBeInTheDocument()
    })
  })

  describe('when rendered without timescale enabled', () => {
    beforeEach(() => {
      setup({
        data: {
          data: {
            flagsMeasurementsActive: false,
            flagsMeasurementsBackfilled: false,
            isTimescaleEnabled: false,
          },
        },
        flags: [],
      })
    })

    it('renders empty state message', async () => {
      render(<FlagsTab />, { wrapper })
      const flagsText = await screen.findByText(
        /The Flags feature is not yet enabled/
      )
      expect(flagsText).toBeInTheDocument()

      const enableText = await screen.findByText(
        /enable flags in your infrastructure today/
      )
      expect(enableText).toBeInTheDocument()
    })
  })
})
