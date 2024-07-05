import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import AdminSettingsHeader from './AdminSettingsHeader'

// temp, for new header work
jest.mock('shared/featureFlags')

const loggedInUser = {
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

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (
    { initialEntries = ['/gh'], path = '/:provider' } = {
      initialEntries: ['/gh'],
      path: '/:provider',
    }
  ) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path={path} exact>
            {children}
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('AdminSettingsHeader', () => {
  function setup() {
    useFlags.mockReturnValue({
      newHeader: false,
    })
    server.use(
      graphql.query('CurrentUser', (_, res, ctx) =>
        res(ctx.status(200), ctx.data(loggedInUser))
      )
    )
  }

  describe('when on global admin', () => {
    beforeEach(() => {
      setup()
    })

    it('displays all orgs and repos link', async () => {
      render(<AdminSettingsHeader />, {
        wrapper: wrapper({
          initialEntries: ['/admin/gh/access'],
          path: '/admin/:provider/access',
        }),
      })
      const link = await screen.findByRole('link', {
        name: 'codecov',
      })
      expect(link).toBeInTheDocument()
    })

    it('links to the right location', async () => {
      render(<AdminSettingsHeader />, {
        wrapper: wrapper({
          initialEntries: ['/admin/gh/access'],
          path: '/admin/:provider/access',
        }),
      })

      const link = await screen.findByRole('link', {
        name: 'codecov',
      })
      expect(link).toHaveAttribute('href', '/gh/codecov')
    })

    it('displays admin', async () => {
      render(<AdminSettingsHeader />, {
        wrapper: wrapper({
          initialEntries: ['/admin/gh/access'],
          path: '/admin/:provider/access',
        }),
      })

      const admin = await screen.findByText('Admin')
      expect(admin).toBeInTheDocument()
    })
  })

  describe('header feature flagging', () => {
    it('renders header when flag is false', async () => {
      setup()
      render(<AdminSettingsHeader />, {
        wrapper: wrapper({
          initialEntries: ['/admin/gh/access'],
          path: '/admin/:provider/access',
        }),
      })

      const admin = await screen.findByText('Admin')
      expect(admin).toBeInTheDocument()
    })

    it('does not render header when flag is true', async () => {
      setup()
      useFlags.mockReturnValue({
        newHeader: true,
      })

      render(<AdminSettingsHeader />, {
        wrapper: wrapper({
          initialEntries: ['/admin/gh/access'],
          path: '/admin/:provider/access',
        }),
      })

      const admin = screen.queryByText('Admin')
      expect(admin).not.toBeInTheDocument()
    })
  })
})
