import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { ActiveContext } from 'shared/context'
import { Plans } from 'shared/utils/billing'

import ListRepo from './ListRepo'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
}))

vi.mock('shared/featureFlags', async () => {
  const original = await vi.importActual('shared/featureFlags')
  return {
    ...original,
    useFlags: mocks.useFlags,
  }
})

vi.mock('./OrgControlTable/RepoOrgNotFound', () => ({
  default: () => 'RepoOrgNotFound',
}))
vi.mock('./ReposTable', () => ({ default: () => 'ReposTable' }))
vi.mock('./ReposTableTeam', () => ({ default: () => 'ReposTableTeam.tsx' }))

const mockUser = {
  me: {
    owner: {
      defaultOrgUsername: 'codecov',
    },
    email: 'jane.doe@codecov.io',
    privateAccess: true,
    onboardingCompleted: true,
    businessEmail: 'jane.doe@codecov.io',
    termsAgreement: true,
    user: {
      name: 'Jane Doe',
      username: 'janedoe',
      avatarUrl: 'http://127.0.0.1/avatar-url',
      avatar: 'http://127.0.0.1/avatar-url',
      student: false,
      studentCreatedAt: null,
      studentUpdatedAt: null,
    },
    trackingMetadata: {
      service: 'github',
      ownerid: 123,
      serviceId: '123',
      plan: Plans.USERS_BASIC,
      staff: false,
      hasYaml: false,
      bot: null,
      delinquent: null,
      didTrial: null,
      planProvider: null,
      planUserCount: 1,
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      profile: {
        createdAt: 'timestamp',
        otherGoal: null,
        typeProjects: [],
        goals: [],
      },
    },
  },
}

const server = setupServer()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: false,
    },
  },
})

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
  console.error = () => {}
})

beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

let testLocation: any

const wrapper =
  ({
    url = '',
    path = '',
    repoDisplay = '',
  }: {
    url?: string
    path?: string
    repoDisplay?: string
  }): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <ActiveContext.Provider value={repoDisplay}>
          <Route path={path}>{children}</Route>
          <Route
            path={path}
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </ActiveContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('ListRepo', () => {
  function setup(
    { isTeamPlan = false }: { isTeamPlan?: boolean },
    me = mockUser
  ) {
    const user = userEvent.setup()

    server.use(
      graphql.query('IsTeamPlan', () => {
        return HttpResponse.json({
          data: { owner: { plan: { isTeamPlan } } },
        })
      }),
      graphql.query('CurrentUser', () => {
        return HttpResponse.json({ data: me })
      })
    )

    return { user, me }
  }

  describe('renders', () => {
    it('renders the children', () => {
      setup({})
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({}),
      })

      expect(screen.getByText(/Not Configured/)).toBeInTheDocument()
    })

    it('renders the repo table', () => {
      setup({})
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({}),
      })

      expect(screen.getByText(/ReposTable/)).toBeInTheDocument()
    })
  })

  describe('reads URL parameters', () => {
    it('reads search parameter from URL', () => {
      setup({})
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({ url: '?search=thisisaquery' }),
      })

      const input = screen.getByTestId('org-control-search')
      expect(input).toHaveValue('thisisaquery')
    })
  })

  describe('switches Configured/Not Configured/All repos', () => {
    it('switches to active repos', async () => {
      const { user } = setup({})
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({ url: '/gh', path: '/:provider' }),
      })

      const button = screen.getByRole('button', {
        name: 'Configured',
      })
      await user.click(button)
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringMatching('Configured')
      )
    })

    it('switches to Not Configured repos', async () => {
      const { user } = setup({})
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({ url: '/gh', path: '/:provider' }),
      })

      const button = screen.getByRole('button', {
        name: /Not Configured/,
      })
      await user.click(button)
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('Not Configured')
      )
    })

    it('switches to Configured repos owner page', async () => {
      const { user } = setup({})
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          url: '/gh/hola',
          path: '/:provider/:owner',
        }),
      })
      const button = screen.getByRole('button', {
        name: 'Configured',
      })
      await user.click(button)
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringMatching('Configured')
      )
    })

    it('switches to all repos owner page', async () => {
      const { user } = setup({})
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          url: '/gh/hola',
          path: '/:provider/:owner',
        }),
      })

      const button = screen.getByRole('button', {
        name: /All/,
      })
      await user.click(button)
      expect(testLocation.state.repoDisplay).toEqual(
        expect.stringContaining('All')
      )
    })
  })

  describe('update params after typing', () => {
    it('calls setSearchValue', async () => {
      const { user } = setup({})
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({}),
      })

      const searchInput = screen.getByRole('textbox', {
        name: /Search/,
      })
      await user.type(searchInput, 'some random repo')

      await waitFor(() => {
        expect(testLocation.state.search).toBe('some random repo')
      })
    })
  })

  describe('when rendered for team plan', () => {
    it('renders the team table', async () => {
      setup({ isTeamPlan: true })
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({}),
      })
      const table = await screen.findByText(/ReposTableTeam/)
      expect(table).toBeInTheDocument()
    })
  })

  describe('welcome demo alert banner', () => {
    it('shows alert banner if it is my owner page and I came from onboarding', async () => {
      const { me } = setup({})
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          url: '/gh/janedoe?source=onboarding',
          path: '/:provider/:owner',
        }),
      })
      expect(me.me.user.username).toEqual('janedoe')
      const alert = await screen.findByRole('alert')
      expect(alert).toBeInTheDocument()
    })

    it('does not show alert banner if I did not come from onboarding', async () => {
      const { me } = setup({})
      render(<ListRepo canRefetch />, {
        wrapper: wrapper({
          url: '/gh/janedoe',
          path: '/:provider/:owner',
        }),
      })
      expect(me.me.user.username).toEqual('janedoe')
      const alert = screen.queryByRole('alert')
      expect(alert).not.toBeInTheDocument()
    })
  })

  describe('user does not have gh app installed', () => {
    it('displays github app config banner', async () => {
      setup({})
      render(<ListRepo canRefetch hasGhApp={false} />, {
        wrapper: wrapper({
          url: '/gh/janedoe',
          path: '/:provider/:owner',
        }),
      })

      await waitFor(() => {
        const banner = screen.getByText("Codecov's GitHub app")
        return expect(banner).toBeInTheDocument()
      })
    })
  })
})
