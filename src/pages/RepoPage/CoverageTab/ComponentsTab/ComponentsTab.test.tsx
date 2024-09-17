import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames, TTierNames } from 'services/tier'

import ComponentsTab from './ComponentsTab'

vi.mock('./BackfillBanners/TriggerSyncBanner/TriggerSyncBanner.tsx', () => ({
  default: () => 'Trigger Sync Banner',
}))
vi.mock('./BackfillBanners/SyncingBanner/SyncingBanner.tsx', () => ({
  default: () => 'Syncing Banner',
}))
vi.mock('./subroute/ComponentsTable/ComponentsTable', () => ({
  default: () => 'Components table',
}))
vi.mock('./Header', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <p>Components Header Component {children}</p>
  ),
}))

const mockRepoSettings = (
  isPrivate = false,
  isCurrentUserPartOfOrg = true
) => ({
  owner: {
    isCurrentUserPartOfOrg,
    repository: {
      __typename: 'Repository',
      activated: true,
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

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
      __typename: 'Repository',
      coverageAnalytics: {
        componentsMeasurementsActive: true,
        componentsMeasurementsBackfilled: true,
      },
    },
  },
}

const backfillDataNotStarted = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        componentsMeasurementsActive: false,
        componentsMeasurementsBackfilled: false,
      },
    },
  },
}

const backfillDataInProgress = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        componentsMeasurementsActive: true,
        componentsMeasurementsBackfilled: false,
      },
    },
  },
}

const backfillDataTimeseriesNotEnabled = {
  config: {
    isTimescaleEnabled: false,
  },
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        componentsMeasurementsActive: false,
        componentsMeasurementsBackfilled: false,
      },
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
    isCurrentUserPartOfOrg = true,
  }: {
    data?: object
    flags?: any[]
    tierValue?: TTierNames
    isPrivate?: boolean
    isCurrentUserPartOfOrg?: boolean
  }) {
    server.use(
      graphql.query('OwnerTier', (info) => {
        if (tierValue === TierNames.TEAM) {
          return HttpResponse.json({
            data: { owner: { plan: { tierName: TierNames.TEAM } } },
          })
        }
        return HttpResponse.json({
          data: { owner: { plan: { tierName: TierNames.PRO } } },
        })
      }),
      graphql.query('GetRepoSettingsTeam', (info) => {
        return HttpResponse.json({
          data: mockRepoSettings(isPrivate, isCurrentUserPartOfOrg),
        })
      }),
      graphql.query('BackfillComponentMemberships', (info) => {
        return HttpResponse.json({ data })
      }),
      graphql.query('FlagsSelect', (info) => {
        const dataReturned = {
          owner: {
            repository: {
              __typename: 'Repository',
              coverageAnalytics: {
                flags: {
                  edges: info.variables.after ? [...flags[0]] : [...flags[1]],
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

  describe('when current user is not part of org and data is not enabled', () => {
    beforeEach(() => {
      setup({
        data: {
          config: {
            isTimescaleEnabled: true,
          },
          owner: {
            repository: {
              __typename: 'Repository',
              componentsMeasurementsActive: false,
              componentsMeasurementsBackfilled: false,
            },
          },
        },
        isCurrentUserPartOfOrg: false,
      })
    })

    it('renders empty state message', async () => {
      render(<ComponentsTab />, { wrapper })
      const componentsText = await screen.findByText(
        /Component analytics is disabled./
      )
      expect(componentsText).toBeInTheDocument()
    })
  })
})
