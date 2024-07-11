import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { User } from 'services/user'

import Header from './Header'

jest.mock('src/layouts/Header/components/Navigator', () => () => 'Navigator')
jest.mock(
  'src/layouts/Header/components/UserDropdown',
  () => () => 'User Dropdown'
)
jest.mock(
  'src/layouts/Header/components/HelpDropdown',
  () => () => 'Help Dropdown'
)
jest.mock('src/layouts/Header/components/AdminLink', () => () => 'Admin Link')
jest.mock(
  'src/layouts/Header/components/SeatDetails',
  () => () => 'Seat Details'
)

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

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

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
    server.use(
      graphql.query('CurrentUser', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(user))
      )
    )
  }

  describe('placeholder new header', () => {
    it('shows when currentUser is defined', async () => {
      setup({})
      render(<Header />, { wrapper })

      const text = await screen.findByText('Navigator')
      expect(text).toBeInTheDocument()
    })
  })

  describe('guest header', () => {
    it('shows when currentUser is null', async () => {
      setup({ user: mockNullUser })
      render(<Header />, { wrapper })

      const link = await screen.findByText('Guest header')
      expect(link).toBeInTheDocument()
    })
  })

  describe('when on self-hosted', () => {
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
