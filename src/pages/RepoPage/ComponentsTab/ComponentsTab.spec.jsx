import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import ComponentsTab from './ComponentsTab'

jest.mock('shared/featureFlags')

jest.mock(
  './BackfillBanners/TriggerSyncBanner/TriggerSyncBanner.tsx',
  () => () => 'Trigger Sync Banner'
)
jest.mock(
  './BackfillBanners/SyncingBanner/SyncingBanner.tsx',
  () => () => 'Syncing Banner'
)
jest.mock(
  './subroute/ComponentsTable/ComponentsTable',
  () => () => 'Components table'
)
jest.mock('./Header', () => ({ children }) => (
  <p>Components Header Component {children}</p>
))

const mockRepoSettings = (isPrivate = false) => ({
  owner: {
    repository: {
      defaultBranch: 'master',
      private: isPrivate,
      uploadToken: 'token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
    },
  },
})

const server = setupServer()
const queryClient = new QueryClient()
let testLocation = {
  pathname: '',
}

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/components']}>
      <Route path="/:provider/:owner/:repo/components">{children}</Route>
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

afterAll(() => {
  server.close()
})

const backfillDataCompleted = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      flagsMeasurementsActive: true,
      flagsMeasurementsBackfilled: true,
    },
  },
}

const backfillDataNotStarted = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      flagsMeasurementsActive: false,
      flagsMeasurementsBackfilled: false,
    },
  },
}

const backfillDataInProgress = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      flagsMeasurementsActive: true,
      flagsMeasurementsBackfilled: false,
    },
  },
}

const backfillDataTimeseriesNotEnabled = {
  config: {
    isTimescaleEnabled: false,
  },
  owner: {
    repository: {
      flagsMeasurementsActive: false,
      flagsMeasurementsBackfilled: false,
    },
  },
}

const initialFlagData = [
  {
    name: 'flag1',
    percentCovered: 93.26,
  },
]

const nextPageFlagData = [
  {
    node: {
      name: 'flag2',
      percentCovered: 92.95,
    },
  },
]

describe('Components Tab', () => {
  function setup({
    data = {},
    flags = [nextPageFlagData, initialFlagData],
    tierValue = TierNames.PRO,
    isPrivate = false,
  }) {
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
      }),
      graphql.query('GetRepoSettingsTeam', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoSettings(isPrivate)))
      }),
      graphql.query('BackfillFlagMemberships', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(data))
      ),
      graphql.query('FlagsSelect', (req, res, ctx) => {
        const dataReturned = {
          owner: {
            repository: {
              flags: {
                edges: req.variables.after ? [...flags[0]] : [...flags[1]],
                pageInfo: {
                  hasNextPage: !req.variables.after,
                  endCursor: req.variables.after ? 'aabb' : 'dW5pdA==',
                },
              },
            },
          },
        }
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
  }

  describe('when user has a team tier', () => {
    describe('the repo is public', () => {
      it('renders the components tab', async () => {
        setup({
          tierValue: TierNames.TEAM,
          isPrivate: false,
          data: backfillDataCompleted,
        })
        render(<ComponentsTab />, { wrapper })

        const header = await screen.findByText(/Components Header Component/)
        expect(header).toBeInTheDocument()
      })
    })

    describe('the repo is private', () => {
      it('redirects to the coverage tab', async () => {
        setup({ tierValue: TierNames.TEAM, isPrivate: true })
        render(<ComponentsTab />, { wrapper })

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/gazebo')
        )
      })
    })
  })

  describe('when rendered without active or backfilled repo', () => {
    beforeEach(() => {
      setup({ data: backfillDataNotStarted })
    })

    it('renders header', async () => {
      render(<ComponentsTab />, { wrapper })

      const header = await screen.findByText(/Components Header Component/)
      expect(header).toBeInTheDocument()
    })

    it('renders trigger sync banner', async () => {
      render(<ComponentsTab />, { wrapper })

      const triggerSyncBanner = await screen.findByText(/Trigger Sync Banner/)
      expect(triggerSyncBanner).toBeInTheDocument()
    })

    it('does not render trigger sync banner', () => {
      render(<ComponentsTab />, { wrapper })

      const syncingBanner = screen.queryByText(/Syncing Banner/)
      expect(syncingBanner).not.toBeInTheDocument()
    })

    it('renders a blurred image of the table', async () => {
      render(<ComponentsTab />, { wrapper })
      const blurredComponentsTableImage = await screen.findByRole('img', {
        name: /Blurred components table/,
      })
      expect(blurredComponentsTableImage).toBeInTheDocument()
    })
  })

  describe('when rendered while ongoing syncing', () => {
    beforeEach(() => {
      setup({ data: backfillDataInProgress })
    })

    it('renders header', async () => {
      render(<ComponentsTab />, { wrapper })

      const header = await screen.findByText(/Components Header Component/)
      expect(header).toBeInTheDocument()
    })

    it('renders trigger sync banner', () => {
      render(<ComponentsTab />, { wrapper })

      const triggerSyncBanner = screen.queryByText(/Trigger Sync Banner/)
      expect(triggerSyncBanner).not.toBeInTheDocument()
    })

    it('does not render trigger sync banner', async () => {
      render(<ComponentsTab />, { wrapper })

      const syncingBanner = await screen.findByText(/Syncing Banner/)
      expect(syncingBanner).toBeInTheDocument()
    })

    it('renders a blurred image of the table', async () => {
      render(<ComponentsTab />, { wrapper })
      const blurredComponentsTableImage = await screen.findByRole('img', {
        name: /Blurred components table/,
      })
      expect(blurredComponentsTableImage).toBeInTheDocument()
    })
  })

  describe('when rendered with backfilled repo', () => {
    beforeEach(() => {
      setup({ data: backfillDataCompleted })
    })

    it('renders header', async () => {
      render(<ComponentsTab />, { wrapper })

      const header = await screen.findByText(/Components Header Component/)
      expect(header).toBeInTheDocument()
    })

    it('renders trigger sync banner', () => {
      render(<ComponentsTab />, { wrapper })

      const triggerSyncBanner = screen.queryByText(/Trigger Sync Banner/)
      expect(triggerSyncBanner).not.toBeInTheDocument()
    })

    it('does not render trigger sync banner', () => {
      render(<ComponentsTab />, { wrapper })

      const syncingBanner = screen.queryByText(/Syncing Banner/)
      expect(syncingBanner).not.toBeInTheDocument()
    })
  })

  describe('when rendered without timescale enabled', () => {
    beforeEach(() => {
      setup({
        data: backfillDataTimeseriesNotEnabled,
        flags: [[], []],
      })
    })

    it('renders empty state message', async () => {
      render(<ComponentsTab />, { wrapper })
      const componentsText = await screen.findByText(
        /The Components feature is not yet enabled/
      )
      expect(componentsText).toBeInTheDocument()

      const enableText = await screen.findByText(
        /enable components in your infrastructure today/
      )
      expect(enableText).toBeInTheDocument()
    })
  })
})
