import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { useLayoutEffect } from 'react'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { RepoBreadcrumbProvider, useCrumbs } from 'pages/RepoPage/context'

import Navigator from './Navigator'

function RepoBaseCrumbSetter() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>()
  const { setBaseCrumbs } = useCrumbs()

  useLayoutEffect(() => {
    setBaseCrumbs([
      { pageName: 'owner', text: owner },
      { pageName: 'repo', text: repo },
    ])
  }, [owner, repo, setBaseCrumbs])

  return null
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: false } },
})
const server = setupServer()

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh/codecov') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <RepoBreadcrumbProvider>
          <Route path="/:provider/:owner/:repo" exact>
            <RepoBaseCrumbSetter />
            {children}
          </Route>
          <Route path="/admin/:provider">{children}</Route>
          <Route path="/analytics/:provider/:owner" exact>
            {children}
          </Route>
          <Route path="/members/:provider/:owner" exact>
            {children}
          </Route>
          <Route path="/plan/:provider/:owner" exact>
            {children}
          </Route>
          <Route path="/account/:provider/:owner" exact>
            {children}
          </Route>
          <Route path="/:provider/:owner" exact>
            {children}
          </Route>
        </RepoBreadcrumbProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )

const mockUser = {
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
}

const orgList = [
  { node: { username: 'codecov', avatarUrl: 'http://127.0.0.1/avatar-url' } },
  { node: { username: 'sentry', avatarUrl: 'http://127.0.0.1/avatar-url' } },
]
const mockMyContexts = {
  me: {
    owner: {
      username: 'cool-user',
      avatarUrl: 'http://127.0.0.1/avatar-url',
      defaultOrgUsername: null,
    },
    myOrganizations: {
      edges: orgList,
      pageInfo: {
        hasNextPage: false,
        endCursor: 'asdf',
      },
    },
  },
}

const mockDetailOwner = {
  owner: {
    ownerid: 1,
    username: 'codecov',
    avatarUrl: 'http://127.0.0.1/avatar-url',
    isCurrentUserPartOfOrg: true,
    isAdmin: true,
  },
}

const mockOwnerPageData = {
  owner: {
    username: 'codecov',
    isCurrentUserPartOfOrg: true,
    numberOfUploads: 345,
    avatarUrl: 'codecov-avatar-url',
  },
}
const mockOwnerPageDataNotInOrg = {
  owner: {
    username: 'not-codecov',
    isCurrentUserPartOfOrg: false,
    numberOfUploads: 123,
    avatarUrl: 'not-codecov-avatar-url',
  },
}

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
  isMyOrg?: boolean
}

describe('Header Navigator', () => {
  function setup({ isMyOrg = true }: SetupArgs) {
    server.use(
      graphql.query('MyContexts', (info) => {
        return HttpResponse.json({ data: mockMyContexts })
      }),
      graphql.query('DetailOwner', (info) => {
        return HttpResponse.json({ data: mockDetailOwner })
      }),
      graphql.query('OwnerPageData', (info) => {
        if (isMyOrg) {
          return HttpResponse.json({ data: mockOwnerPageData })
        }

        return HttpResponse.json({ data: mockOwnerPageDataNotInOrg })
      })
    )

    return {
      user: userEvent.setup({}),
    }
  }

  describe('when on repo page', () => {
    it('should render repo breadcrumb', async () => {
      setup({})
      render(<Navigator currentUser={mockUser} />, {
        wrapper: wrapper('/gh/codecov/test-repo'),
      })

      const org = await screen.findByText('codecov')
      expect(org).toBeInTheDocument()

      const repo = await screen.findByText('test-repo')
      expect(repo).toBeInTheDocument()
    })
  })

  describe('when on self-hosted admin settings page', () => {
    it('should render admin breadcrumb', async () => {
      setup({})
      render(<Navigator currentUser={mockUser} />, {
        wrapper: wrapper('/admin/gh/access'),
      })

      const defaultOrg = await screen.findByText('codecov')
      expect(defaultOrg).toBeInTheDocument()

      const admin = await screen.findByText('Admin')
      expect(admin).toBeInTheDocument()
    })
  })

  describe('when viewing owner page', () => {
    describe('and user is not part of the org', () => {
      it('should render non-ContextSwitcher owner page variant', async () => {
        const { user } = setup({ isMyOrg: false })
        render(<Navigator currentUser={mockUser} />, {
          wrapper: wrapper('/gh/not-codecov'),
        })

        const org = await screen.findByText('not-codecov')
        expect(org).toBeInTheDocument()

        await user.click(org)

        const sentryOrg = screen.queryByRole('link', { name: 'sentry' })
        expect(sentryOrg).not.toBeInTheDocument()
      })
    })
  })

  describe('when on owner analytics page', () => {
    it('should render MyContextSwitcher with analytics link', async () => {
      const { user } = setup({})
      render(<Navigator currentUser={mockUser} />, {
        wrapper: wrapper('/analytics/gh/codecov'),
      })

      const contextSwitcher = await screen.findAllByText('codecov')
      expect(contextSwitcher).not.toHaveLength(0)

      await user.click(contextSwitcher[0]!)

      const sentryOrg = await screen.findByRole('link', { name: 'sentry' })
      expect(sentryOrg).toBeInTheDocument()
      expect(sentryOrg).toHaveAttribute('href', '/analytics/gh/sentry')
    })
  })

  describe('when on members page', () => {
    it('should render MyContextSwitcher with members link', async () => {
      const { user } = setup({})
      render(<Navigator currentUser={mockUser} />, {
        wrapper: wrapper('/members/gh/codecov'),
      })

      const contextSwitcher = await screen.findAllByText('codecov')
      expect(contextSwitcher).not.toHaveLength(0)

      await user.click(contextSwitcher[0]!)

      const sentryOrg = await screen.findByRole('link', { name: 'sentry' })
      expect(sentryOrg).toBeInTheDocument()
      expect(sentryOrg).toHaveAttribute('href', '/members/gh/sentry')
    })
  })

  describe('when on plan page', () => {
    it('should render MyContextSwitcher with plan link', async () => {
      const { user } = setup({})
      render(<Navigator currentUser={mockUser} />, {
        wrapper: wrapper('/plan/gh/codecov'),
      })

      const contextSwitcher = await screen.findAllByText('codecov')
      expect(contextSwitcher).not.toHaveLength(0)

      await user.click(contextSwitcher[0]!)

      const sentryOrg = await screen.findByRole('link', { name: 'sentry' })
      expect(sentryOrg).toBeInTheDocument()
      expect(sentryOrg).toHaveAttribute('href', '/plan/gh/sentry')
    })
  })

  describe('when on account page', () => {
    it('should render MyContextSwitcher with account link', async () => {
      const { user } = setup({})
      render(<Navigator currentUser={mockUser} />, {
        wrapper: wrapper('/account/gh/codecov'),
      })

      const contextSwitcher = await screen.findAllByText('codecov')
      expect(contextSwitcher).not.toHaveLength(0)

      await user.click(contextSwitcher[0]!)

      const sentryOrg = await screen.findByRole('link', { name: 'sentry' })
      expect(sentryOrg).toBeInTheDocument()
      expect(sentryOrg).toHaveAttribute('href', '/account/gh/sentry')
    })
  })

  describe('when on owner page', () => {
    it('should render MyContextSwitcher with owner page link', async () => {
      const { user } = setup({})
      render(<Navigator currentUser={mockUser} />, {
        wrapper: wrapper('/gh/codecov'),
      })

      const contextSwitcher = await screen.findAllByText('codecov')
      expect(contextSwitcher).not.toHaveLength(0)

      await user.click(contextSwitcher[0]!)

      const sentryOrg = await screen.findByRole('link', { name: 'sentry' })
      expect(sentryOrg).toBeInTheDocument()
      expect(sentryOrg).toHaveAttribute('href', '/gh/sentry')
    })
  })
})
