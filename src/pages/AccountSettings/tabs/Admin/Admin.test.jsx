import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import Admin from './Admin'

vi.mock('./DetailsSection', () => ({ default: () => 'DetailsSection' }))
vi.mock('./StudentSection', () => ({ default: () => 'StudentSection' }))
vi.mock('./GithubIntegrationSection', () => ({
  default: () => 'GithubIntegrationSection',
}))
vi.mock('./ManageAdminCard', () => ({ default: () => 'ManageAdminCard' }))
vi.mock('./DeletionCard', () => ({ default: () => 'DeletionCard' }))

const user = {
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/account/gh/janedoe']}>
      <Route path="/account/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('AdminTab', () => {
  function setup() {
    server.use(
      graphql.query('CurrentUser', () => {
        return HttpResponse.json({ data: user })
      })
    )
  }

  describe('when rendered for user', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the DetailsSection', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/DetailsSection/)
      expect(card).toBeInTheDocument()
    })

    it('renders the StudentSection', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/StudentSection/)
      expect(card).toBeInTheDocument()
    })

    it('renders the GithubIntegrationSection', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/GithubIntegrationSection/)
      expect(card).toBeInTheDocument()
    })

    it('renders the DeletionCard', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/DeletionCard/)
      expect(card).toBeInTheDocument()
    })
  })

  describe('when rendered for organization', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the ManageAdminCard', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/ManageAdminCard/)
      expect(card).toBeInTheDocument()
    })

    it('renders the GithubIntegrationSection', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/GithubIntegrationSection/)
      expect(card).toBeInTheDocument()
    })

    it('renders the DeletionCard', async () => {
      render(<Admin />, { wrapper })

      const card = await screen.findByText(/DeletionCard/)
      expect(card).toBeInTheDocument()
    })
  })
})
