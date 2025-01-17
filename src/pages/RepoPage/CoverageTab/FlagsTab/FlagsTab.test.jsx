import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import FlagsTab from './FlagsTab'

const mocks = vi.hoisted(() => ({
  useRepoFlagsSelect: vi.fn(),
  useRepoBackfilled: vi.fn(),
}))

vi.mock('services/repo', async () => {
  const actual = await vi.importActual('services/repo')
  return {
    ...actual,
    useRepoFlagsSelect: mocks.useRepoFlagsSelect,
    useRepoBackfilled: mocks.useRepoBackfilled,
  }
})

vi.mock('./BackfillBanners/TriggerSyncBanner/TriggerSyncBanner.tsx', () => ({
  default: () => 'Trigger Sync Banner',
}))
vi.mock('./BackfillBanners/SyncingBanner/SyncingBanner.tsx', () => ({
  default: () => 'Syncing Banner',
}))
vi.mock('./subroute/FlagsTable/FlagsTable', () => ({
  default: () => 'Flags table',
}))
vi.mock('./Header', () => ({
  default: ({ children }) => <p>Flags Header Component {children}</p>,
}))

const flagsData = [
  {
    name: 'flag1',
  },
  {
    name: 'flag2',
  },
]

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

afterAll(() => {
  server.close()
})

describe('Flags Tab', () => {
  function setup({
    data = {},
    flags = flagsData,
    isTeamPlan = false,
    isPrivate = false,
    isCurrentUserPartOfOrg = true,
  }) {
    mocks.useRepoFlagsSelect.mockReturnValue({ data: flags })
    mocks.useRepoBackfilled.mockReturnValue(data)

    server.use(
      graphql.query('OwnerPlan', () => {
        return HttpResponse.json({
          data: { owner: { plan: { isTeamPlan } } },
        })
      }),
      graphql.query('GetRepoSettingsTeam', () => {
        return HttpResponse.json({
          data: mockRepoSettings(isPrivate, isCurrentUserPartOfOrg),
        })
      })
    )
  }

  describe('when user has a team plan', () => {
    describe('the repo is public', () => {
      it('renders the flags tab', async () => {
        setup({
          isTeamPlan: true,
          isPrivate: false,
          data: {
            data: {
              flagsMeasurementsActive: true,
              flagsMeasurementsBackfilled: true,
              isTimescaleEnabled: true,
            },
          },
        })
        render(<FlagsTab />, { wrapper })

        const header = await screen.findByText(/Flags Header Component/)
        expect(header).toBeInTheDocument()
      })
    })

    describe('the repo is private', () => {
      it('redirects to the coverage tab', async () => {
        setup({ isTeamPlan: true, isPrivate: true })
        render(<FlagsTab />, { wrapper })

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/gh/codecov/gazebo')
        )
      })
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

  describe('when current user is not part of org and data is not enabled', () => {
    beforeEach(() => {
      setup({
        data: {
          data: {
            flagsMeasurementsActive: true,
            flagsMeasurementsBackfilled: true,
            isTimescaleEnabled: true,
          },
        },
        flags: [
          {
            name: 'flag1',
          },
          {
            name: 'flag2',
          },
        ],
        isCurrentUserPartOfOrg: false,
      })
    })

    it('renders empty state message', async () => {
      render(<FlagsTab />, { wrapper })
      const flagsText = await screen.findByText(/Flag analytics is disabled./)
      expect(flagsText).toBeInTheDocument()
    })
  })
})
