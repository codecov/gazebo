import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, Switch, useLocation } from 'react-router-dom'
import { type Mock } from 'vitest'

import config from 'config'

import { useImage } from 'services/image'
import { Plans } from 'shared/utils/billing'

import UserDropdown from './UserDropdown'

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
      customerIntent: 'PERSONAL',
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

vi.mock('services/image')
vi.mock('config')
vi.mock('js-cookie')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
let testLocation: ReturnType<typeof useLocation>

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Switch>
          <Route path="/:provider" exact>
            {children}
            <Route
              path="*"
              render={({ location }) => {
                testLocation = location
                return null
              }}
            />
          </Route>
        </Switch>
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

describe('UserDropdown', () => {
  function setup({ selfHosted } = { selfHosted: false }) {
    const mockUseImage = useImage as Mock
    mockUseImage.mockReturnValue({
      src: 'imageUrl',
      isLoading: false,
      error: null,
    })
    config.IS_SELF_HOSTED = selfHosted
    config.API_URL = ''

    server.use(
      http.post('/logout', (info) => {
        return HttpResponse.json({}, { status: 205 })
      }),
      graphql.query('CurrentUser', (info) => {
        return HttpResponse.json({ data: mockUser })
      })
    )

    return {
      user: userEvent.setup(),
    }
  }

  describe('when rendered', () => {
    beforeEach(() => setup())

    it('renders the users avatar', () => {
      render(<UserDropdown />, {
        wrapper: wrapper(),
      })

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'avatar')
    })
  })

  describe('when on GitHub', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })
    describe('when the avatar is clicked', () => {
      it('shows settings link', async () => {
        const { user } = setup()
        render(<UserDropdown />, {
          wrapper: wrapper(),
        })

        expect(screen.queryByText('Settings')).not.toBeInTheDocument()

        const openSelect = await screen.findByTestId('user-dropdown-trigger')
        await user.click(openSelect)

        const link = screen.getByText('Settings')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href', '/account/gh/janedoe')
      })

      it('shows sign out button', async () => {
        const { user } = setup()
        render(<UserDropdown />, {
          wrapper: wrapper(),
        })

        expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()

        const openSelect = await screen.findByTestId('user-dropdown-trigger')
        await user.click(openSelect)

        const link = screen.getByText('Sign Out')
        expect(link).toBeVisible()
      })

      it('handles sign out', async () => {
        const { user } = setup()

        vi.spyOn(console, 'error').mockImplementation(() => {})
        render(<UserDropdown />, {
          wrapper: wrapper(),
        })

        const openSelect = await screen.findByTestId('user-dropdown-trigger')
        await user.click(openSelect)

        const button = screen.getByText('Sign Out')
        expect(button).toBeVisible()
        await user.click(button)

        await waitFor(() => expect(testLocation.pathname).toBe('/login'))
      })

      it('shows manage app access link', async () => {
        const { user } = setup()
        render(<UserDropdown />, {
          wrapper: wrapper(),
        })

        expect(
          screen.queryByText('Install Codecov app')
        ).not.toBeInTheDocument()

        const openSelect = await screen.findByTestId('user-dropdown-trigger')
        await user.click(openSelect)

        const link = screen.getByText('Install Codecov app')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute(
          'href',
          'https://github.com/apps/codecov/installations/new'
        )
      })
    })
  })
  describe('when not on GitHub', () => {
    describe('when the avatar is clicked', () => {
      it('shows settings link', async () => {
        const { user } = setup()
        render(<UserDropdown />, {
          wrapper: wrapper('/gl'),
        })

        expect(screen.queryByText('Settings')).not.toBeInTheDocument()

        const openSelect = await screen.findByTestId('user-dropdown-trigger')
        await user.click(openSelect)

        const link = screen.getByText('Settings')
        expect(link).toBeVisible()
        expect(link).toHaveAttribute('href', '/account/gl/janedoe')
      })

      it('shows sign out button', async () => {
        const { user } = setup()
        render(<UserDropdown />, {
          wrapper: wrapper('/gl'),
        })

        expect(screen.queryByText('Sign Out')).not.toBeInTheDocument()

        const openSelect = await screen.findByTestId('user-dropdown-trigger')
        await user.click(openSelect)

        const link = screen.getByText('Sign Out')
        expect(link).toBeVisible()
      })

      it('handles sign out', async () => {
        const { user } = setup()

        vi.spyOn(console, 'error').mockImplementation(() => {})
        render(<UserDropdown />, {
          wrapper: wrapper(),
        })

        const openSelect = await screen.findByTestId('user-dropdown-trigger')
        await user.click(openSelect)

        const button = screen.getByText('Sign Out')
        expect(button).toBeVisible()
        await user.click(button)

        await waitFor(() => expect(testLocation.pathname).toBe('/login'))
      })

      it('does not show manage app access link', async () => {
        const { user } = setup()
        render(<UserDropdown />, {
          wrapper: wrapper('/gl'),
        })

        expect(
          screen.queryByText('Install Codecov app')
        ).not.toBeInTheDocument()

        const openSelect = await screen.findByTestId('user-dropdown-trigger')
        await user.click(openSelect)

        expect(
          screen.queryByText('Install Codecov app')
        ).not.toBeInTheDocument()
      })
    })
  })
})
