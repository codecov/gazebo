import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type Mock, vi } from 'vitest'

import config from 'config'

import { useImpersonate } from 'services/impersonate'
import { User } from 'services/user'
import { useFlags } from 'shared/featureFlags'

import Header from './Header'

vi.mock('src/layouts/Header/components/Navigator', () => ({
  default: () => 'Navigator',
}))
vi.mock('src/layouts/Header/components/UserDropdown', () => ({
  default: () => 'User Dropdown',
}))
vi.mock('src/layouts/Header/components/HelpDropdown', () => ({
  default: () => 'Help Dropdown',
}))
vi.mock('src/layouts/Header/components/AdminLink', () => ({
  default: () => 'Admin Link',
}))
vi.mock('src/layouts/Header/components/SeatDetails', () => ({
  default: () => 'Seat Details',
}))
vi.mock('src/layouts/Header/components/ThemeToggle', () => ({
  default: () => 'Theme Toggle',
}))

vi.mock('services/impersonate')
vi.mock('shared/featureFlags')
const mockedUseImpersonate = useImpersonate as Mock
const mockedUseFlags = useFlags as Mock

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
      plan: 'users-basic',
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

const mockNullUser = { me: null }

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={[`/gh/codecov/test-repo`]}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

type SetupArgs = {
  user?: User
}

describe('Header', () => {
  function setup({ user = mockUser }: SetupArgs) {
    mockedUseImpersonate.mockReturnValue({ isImpersonating: false })
    mockedUseFlags.mockReturnValue({ darkMode: false })
    server.use(
      graphql.query('CurrentUser', (info) => {
        return HttpResponse.json({ data: user })
      })
    )
  }

  describe('when impersonating', () => {
    it('shows impersonating banner', async () => {
      setup({})
      mockedUseImpersonate.mockReturnValue({ isImpersonating: true })
      render(<Header />, { wrapper })

      const impersonatingBanner = await screen.findByText('Impersonating')
      expect(impersonatingBanner).toBeInTheDocument()
    })
  })
  describe('when are not logged in', () => {
    it('shows guest header', async () => {
      setup({ user: mockNullUser })
      render(<Header />, { wrapper })

      const guestHeader = await screen.findByText('Why Test Code?')
      expect(guestHeader).toBeInTheDocument()
    })

    it('shows navigator', async () => {
      setup({})
      render(<Header />, { wrapper })

      const navigator = await screen.findByText('Navigator')
      expect(navigator).toBeInTheDocument()
    })

    it('does not show user/help dropdowns', async () => {
      setup({})
      render(<Header />, { wrapper })

      const userDropdown = screen.queryByText('User Dropdown')
      expect(userDropdown).not.toBeInTheDocument()
      const helpDropdown = screen.queryByText('Help Dropdown')
      expect(helpDropdown).not.toBeInTheDocument()
    })
  })

  describe('when logged in', () => {
    it('shows navigator', async () => {
      setup({})
      render(<Header />, { wrapper })

      const navigator = await screen.findByText('Navigator')
      expect(navigator).toBeInTheDocument()
    })

    it('shows help dropdown', async () => {
      setup({})
      render(<Header />, { wrapper })

      const helpDropdown = await screen.findByText(/Help Dropdown/)
      expect(helpDropdown).toBeInTheDocument()
    })

    it('shows user dropdown', async () => {
      setup({})
      render(<Header />, { wrapper })

      const userDropdown = await screen.findByText(/User Dropdown/)
      expect(userDropdown).toBeInTheDocument()
    })
    it('has toggle for light/dark mode when flag on', async () => {
      setup({})
      mockedUseFlags.mockReturnValue({ darkMode: true })
      render(<Header />, { wrapper })

      const toggle = await screen.findByText(/Theme Toggle/)
      expect(toggle).toBeInTheDocument()
    })
    it('has no toggle for light/dark mode when flag off', () => {
      setup({})
      render(<Header />, { wrapper })

      const toggle = screen.queryAllByText(/Theme Toggle/)
      expect(toggle).toEqual([])
    })
  })

  describe('when on self-hosted', () => {
    describe('and are not logged in', () => {
      it('shows guest header', async () => {
        config.IS_SELF_HOSTED = true
        setup({ user: mockNullUser })
        render(<Header />, { wrapper })

        const guestHeader = await screen.findByText('Why Test Code?')
        expect(guestHeader).toBeInTheDocument()
      })

      it('shows navigator', async () => {
        setup({})
        render(<Header />, { wrapper })

        const navigator = await screen.findByText('Navigator')
        expect(navigator).toBeInTheDocument()
      })

      it('does not show user/help dropdowns', async () => {
        setup({})
        render(<Header />, { wrapper })

        const userDropdown = screen.queryByText('User Dropdown')
        expect(userDropdown).not.toBeInTheDocument()
        const helpDropdown = screen.queryByText('Help Dropdown')
        expect(helpDropdown).not.toBeInTheDocument()
      })
    })

    describe('and are logged in', () => {
      it('shows seat details', async () => {
        config.IS_SELF_HOSTED = true
        setup({})
        render(<Header />, { wrapper })

        const text = await screen.findByText(/Seat Details/)
        expect(text).toBeInTheDocument()
      })

      it('shows Admin link', async () => {
        config.IS_SELF_HOSTED = true
        setup({})
        render(<Header />, { wrapper })

        const text = await screen.findByText(/Admin Link/)
        expect(text).toBeInTheDocument()
      })
    })
  })
})
