import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { TierNames, TTierNames } from 'services/tier'

import CoverageTab from './CoverageTab'

const mockRepoSettingsTeam = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      defaultBranch: 'master',
      private: true,
      uploadToken: 'token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
      activated: true,
    },
  },
}

vi.mock('./OverviewTab', () => ({
  default: () => 'OverviewTab',
}))
vi.mock('./FlagsTab', () => ({
  default: () => 'FlagsTab',
}))
vi.mock('./ComponentsTab', () => ({
  default: () => 'ComponentsTab',
}))
vi.mock('ui/LoadingLogo', () => ({ default: () => 'Loader' }))

let testLocation: ReturnType<typeof useLocation>

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: true,
    },
  },
})

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh/codecov/cool-repo') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo',
            '/:provider/:owner/:repo/flags',
            '/:provider/:owner/:repo/components',
          ]}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    </QueryClientProvider>
  )

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

interface SetupArgs {
  tierName?: TTierNames
}

describe('CoverageTab', () => {
  function setup({ tierName = TierNames.PRO }: SetupArgs) {
    server.use(
      graphql.query('OwnerTier', (info) => {
        return HttpResponse.json({ data: { owner: { plan: { tierName } } } })
      }),
      graphql.query('GetRepoSettingsTeam', (info) => {
        return HttpResponse.json({ data: mockRepoSettingsTeam })
      })
    )
  }

  it('renders navigator and tab contents', async () => {
    setup({})
    render(<CoverageTab />, { wrapper: wrapper() })

    const overview = await screen.findByText('Overview')
    const flags = await screen.findByText('Flags')
    const components = await screen.findByText('Components')
    expect(overview).toBeInTheDocument()
    expect(flags).toBeInTheDocument()
    expect(components).toBeInTheDocument()

    const content = await screen.findByText('OverviewTab')
    expect(content).toBeInTheDocument()
  })

  it('hides navigator when on team plan and private repo', async () => {
    setup({ tierName: TierNames.TEAM })
    render(<CoverageTab />, { wrapper: wrapper() })

    const overview = await screen.findByText('OverviewTab')
    expect(overview).toBeInTheDocument()

    const overviewTab = screen.queryByText('Overview')
    const flagsTab = screen.queryByText('Flags')
    const componentsTab = screen.queryByText('Components')
    expect(overviewTab).not.toBeInTheDocument()
    expect(flagsTab).not.toBeInTheDocument()
    expect(componentsTab).not.toBeInTheDocument()
  })

  describe('navigator initial selection', () => {
    describe('when not on flags or components tabs', () => {
      it('selects Overview as default', async () => {
        setup({})
        render(<CoverageTab />, { wrapper: wrapper() })

        const overview = await screen.findByTestId('overview-radio')
        expect(overview).toBeInTheDocument()
        expect(overview).toHaveAttribute('data-state', 'checked')
        const content = await screen.findByText('OverviewTab')
        expect(content).toBeInTheDocument()
      })
    })

    describe('when loaded with flags url', () => {
      it('selects flags as default', async () => {
        setup({})
        render(<CoverageTab />, {
          wrapper: wrapper('/gh/codecov/cool-repo/flags'),
        })

        const flags = await screen.findByTestId('flags-radio')
        expect(flags).toBeInTheDocument()
        expect(flags).toHaveAttribute('data-state', 'checked')
        const content = await screen.findByText('FlagsTab')
        expect(content).toBeInTheDocument()
      })
    })

    describe('when loaded with components url', () => {
      it('selects components as default', async () => {
        setup({})
        render(<CoverageTab />, {
          wrapper: wrapper('/gh/codecov/cool-repo/components'),
        })

        const components = await screen.findByTestId('components-radio')
        expect(components).toBeInTheDocument()
        expect(components).toHaveAttribute('data-state', 'checked')
        const content = await screen.findByText('ComponentsTab')
        expect(content).toBeInTheDocument()
      })
    })

    it('matches path with query params', async () => {
      setup({})
      render(<CoverageTab />, {
        wrapper: wrapper('/gh/codecov/cool-repo/components?branch=asdf'),
      })

      const components = await screen.findByTestId('components-radio')
      expect(components).toBeInTheDocument()
      expect(components).toHaveAttribute('data-state', 'checked')
      const content = await screen.findByText('ComponentsTab')
      expect(content).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    describe('when Overview is selected', () => {
      it('should navigate to base coverage tab', async () => {
        setup({})
        const user = userEvent.setup()
        render(<CoverageTab />, {
          wrapper: wrapper('/gh/codecov/cool-repo/flags'),
        })

        const overview = await screen.findByTestId('overview-radio')
        expect(overview).toBeInTheDocument()
        expect(overview).toHaveAttribute('data-state', 'unchecked')
        const flagsTab = await screen.findByText('FlagsTab')
        expect(flagsTab).toBeInTheDocument()

        await user.click(overview)

        expect(overview).toBeInTheDocument()
        expect(overview).toHaveAttribute('data-state', 'checked')
        const overviewTab = await screen.findByText('OverviewTab')
        expect(overviewTab).toBeInTheDocument()

        expect(testLocation.pathname).toBe('/gh/codecov/cool-repo')
      })
    })

    describe('when Flags is selected', () => {
      it('should navigate to flags coverage tab', async () => {
        setup({})
        const user = userEvent.setup()
        render(<CoverageTab />, {
          wrapper: wrapper('/gh/codecov/cool-repo'),
        })

        const flags = await screen.findByTestId('flags-radio')
        expect(flags).toBeInTheDocument()
        expect(flags).toHaveAttribute('data-state', 'unchecked')
        const overviewTab = await screen.findByText('OverviewTab')
        expect(overviewTab).toBeInTheDocument()

        await user.click(flags)

        expect(flags).toBeInTheDocument()
        expect(flags).toHaveAttribute('data-state', 'checked')
        const flagsTab = await screen.findByText('FlagsTab')
        expect(flagsTab).toBeInTheDocument()

        expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/flags')
      })
    })

    describe('when Components is selected', () => {
      it('should navigate to components coverage tab', async () => {
        setup({})
        const user = userEvent.setup()
        render(<CoverageTab />, {
          wrapper: wrapper('/gh/codecov/cool-repo'),
        })

        const components = await screen.findByTestId('components-radio')
        expect(components).toBeInTheDocument()
        expect(components).toHaveAttribute('data-state', 'unchecked')
        const overviewTab = await screen.findByText('OverviewTab')
        expect(overviewTab).toBeInTheDocument()

        await user.click(components)

        expect(components).toBeInTheDocument()
        expect(components).toHaveAttribute('data-state', 'checked')
        const componentsTab = await screen.findByText('ComponentsTab')
        expect(componentsTab).toBeInTheDocument()

        expect(testLocation.pathname).toBe('/gh/codecov/cool-repo/components')
      })
    })
  })
})
