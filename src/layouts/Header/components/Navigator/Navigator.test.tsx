import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useLayoutEffect } from 'react'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { RepoBreadcrumbProvider, useCrumbs } from 'pages/RepoPage/context'
import { Plans } from 'shared/utils/billing'

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

const wrapper: ({
  initialEntries,
  path,
}: {
  initialEntries: string
  path: string
}) => React.FC<React.PropsWithChildren> =
  ({ initialEntries, path }) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <RepoBreadcrumbProvider>
          <Route path={path}>
            <RepoBaseCrumbSetter />
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

const mockDetailOwnerNotMyOrg = {
  owner: {
    ownerid: 1,
    username: 'not-codecov',
    avatarUrl: 'http://127.0.0.1/avatar-url',
    isCurrentUserPartOfOrg: false,
    isAdmin: false,
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
  orgDoesNotExist?: boolean
}

describe('Header Navigator', () => {
  function setup({ isMyOrg = true, orgDoesNotExist = false }: SetupArgs) {
    server.use(
      graphql.query('MyContexts', (info) => {
        return HttpResponse.json({ data: mockMyContexts })
      }),
      graphql.query('DetailOwner', (info) => {
        if (orgDoesNotExist) {
          return HttpResponse.json({ data: { owner: null } })
        }

        if (!isMyOrg) {
          return HttpResponse.json({ data: mockDetailOwnerNotMyOrg })
        }

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
    describe('user has access to the repo', () => {
      it('should render repo breadcrumb', async () => {
        setup({})
        render(<Navigator currentUser={mockUser} hasRepoAccess={true} />, {
          wrapper: wrapper({
            initialEntries: '/gh/codecov/test-repo',
            path: '/:provider/:owner/:repo',
          }),
        })

        const org = await screen.findByText('codecov')
        expect(org).toBeInTheDocument()

        const repo = await screen.findByText('test-repo')
        expect(repo).toBeInTheDocument()
      })

      it('should not show Viewing as Visitor when user is part of the org', async () => {
        setup({ isMyOrg: true })
        render(<Navigator currentUser={mockUser} hasRepoAccess={true} />, {
          wrapper: wrapper({
            initialEntries: '/gh/not-codecov/test-repo',
            path: '/:provider/:owner/:repo',
          }),
        })

        const org = await screen.findByText('not-codecov')
        expect(org).toBeInTheDocument()

        const text = screen.queryByText('Viewing as visitor')
        await waitFor(() => expect(text).not.toBeInTheDocument())
      })

      it('should show Viewing as Visitor if appropriate', async () => {
        setup({ isMyOrg: false })
        render(<Navigator currentUser={mockUser} hasRepoAccess={true} />, {
          wrapper: wrapper({
            initialEntries: '/gh/not-codecov/test-repo',
            path: '/:provider/:owner/:repo',
          }),
        })

        const org = await screen.findByText('not-codecov')
        expect(org).toBeInTheDocument()

        const text = await screen.findByText('Viewing as visitor')
        expect(text).toBeInTheDocument()
      })
    })

    describe('user does not have access and the org exists', () => {
      it('renders MyContextSwitcher', async () => {
        setup({ isMyOrg: false })
        render(<Navigator currentUser={mockUser} hasRepoAccess={false} />, {
          wrapper: wrapper({
            initialEntries: '/gh/not-codecov/test-repo',
            path: '/:provider/:owner/:repo',
          }),
        })

        const contextSwitcher = await screen.findByText('not-codecov')
        expect(contextSwitcher).toBeInTheDocument()
      })

      describe('the user is not a visitor', () => {
        it('should not show Viewing as Visitor', async () => {
          setup({ isMyOrg: true })
          render(<Navigator currentUser={mockUser} hasRepoAccess={false} />, {
            wrapper: wrapper({
              initialEntries: '/gh/not-codecov/test-repo',
              path: '/:provider/:owner/:repo',
            }),
          })

          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isFetching())

          const text = screen.queryByText('Viewing as visitor')
          expect(text).not.toBeInTheDocument()
        })
      })

      describe('the user is a visitor', () => {
        it('should show Viewing as Visitor', async () => {
          setup({ isMyOrg: false })
          render(<Navigator currentUser={mockUser} hasRepoAccess={false} />, {
            wrapper: wrapper({
              initialEntries: '/gh/not-codecov/test-repo',
              path: '/:provider/:owner/:repo',
            }),
          })

          const text = await screen.findByText('Viewing as visitor')
          expect(text).toBeInTheDocument()
        })
      })
    })

    describe('user does not exist', () => {
      it('should not render anything', async () => {
        setup({ isMyOrg: false })
        const { container } = render(
          <Navigator currentUser={undefined} hasRepoAccess={false} />,
          {
            wrapper: wrapper({
              initialEntries: '/gh/not-codecov/test-repo',
              path: '/:provider/:owner/:repo',
            }),
          }
        )

        await waitFor(() => expect(container).toBeEmptyDOMElement())
      })
    })
  })

  describe('when on self-hosted admin settings page', () => {
    it('should render admin breadcrumb', async () => {
      setup({})
      render(<Navigator currentUser={mockUser} />, {
        wrapper: wrapper({
          initialEntries: '/admin/gh/access',
          path: '/admin/:provider',
        }),
      })

      const defaultOrg = await screen.findByText('codecov')
      expect(defaultOrg).toBeInTheDocument()

      const admin = await screen.findByText('Admin')
      expect(admin).toBeInTheDocument()
    })
  })

  describe('when viewing owner page', () => {
    describe('user is part of the org', () => {
      it('renders the org dropdown', async () => {
        setup({ isMyOrg: true })
        render(<Navigator currentUser={mockUser} />, {
          wrapper: wrapper({
            initialEntries: '/gh/codecov',
            path: '/:provider/:owner',
          }),
        })

        const org = await screen.findByRole('button', { name: 'codecov' })
        expect(org).toBeInTheDocument()
      })

      it('does not render Viewing as Visitor', async () => {
        setup({ isMyOrg: true })
        render(<Navigator currentUser={mockUser} />, {
          wrapper: wrapper({
            initialEntries: '/gh/codecov',
            path: '/:provider/:owner',
          }),
        })

        await waitFor(() => queryClient.isFetching())
        await waitFor(() => !queryClient.isFetching())

        const text = screen.queryByText('Viewing as visitor')
        expect(text).not.toBeInTheDocument()
      })
    })

    describe('and user is not part of the org', () => {
      it('should still render the user orgs dropdown', async () => {
        const { user } = setup({ isMyOrg: false })
        render(<Navigator currentUser={mockUser} />, {
          wrapper: wrapper({
            initialEntries: '/gh/not-codecov',
            path: '/:provider/:owner',
          }),
        })

        const org = await screen.findByText('not-codecov')
        expect(org).toBeInTheDocument()

        await user.click(org)

        const sentryOrg = screen.queryByRole('link', { name: 'sentry' })
        expect(sentryOrg).toBeInTheDocument()
      })

      it('renders viewing as a visitor', async () => {
        setup({ isMyOrg: false })
        render(<Navigator currentUser={mockUser} />, {
          wrapper: wrapper({
            initialEntries: '/gh/not-codecov',
            path: '/:provider/:owner',
          }),
        })

        const viewingAsVisitor = await screen.findByText('Viewing as visitor')
        expect(viewingAsVisitor).toBeInTheDocument()
      })
    })

    describe('when the owner does not exist', () => {
      it('renders the owner url param in the button', async () => {
        setup({ orgDoesNotExist: true })
        render(<Navigator currentUser={mockUser} />, {
          wrapper: wrapper({
            initialEntries: '/gh/random-org',
            path: '/:provider/:owner',
          }),
        })

        const button = await screen.findByRole('button')
        await waitFor(() => expect(button).toHaveTextContent('random-org'))
      })
    })

    it('should show the fallback if not logged in', async () => {
      const { user } = setup({ isMyOrg: false })
      render(<Navigator currentUser={undefined} />, {
        wrapper: wrapper({
          initialEntries: '/gh/not-codecov',
          path: '/:provider/:owner',
        }),
      })

      await waitFor(() => queryClient.isFetching())
      await waitFor(() => !queryClient.isFetching())

      const org = await screen.findByText('not-codecov')
      expect(org).toBeInTheDocument()

      await user.click(org)

      const dropdownText = screen.queryByText('Install Codecov GitHub app')
      expect(dropdownText).not.toBeInTheDocument()
    })
  })

  describe('when on owner analytics page', () => {
    it('should render MyContextSwitcher with analytics link', async () => {
      const { user } = setup({})
      render(<Navigator currentUser={mockUser} />, {
        wrapper: wrapper({
          initialEntries: '/analytics/gh/codecov',
          path: '/analytics/:provider/:owner',
        }),
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
        wrapper: wrapper({
          initialEntries: '/members/gh/codecov',
          path: '/members/:provider/:owner',
        }),
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
        wrapper: wrapper({
          initialEntries: '/plan/gh/codecov',
          path: '/plan/:provider/:owner',
        }),
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
        wrapper: wrapper({
          initialEntries: '/account/gh/codecov',
          path: '/account/:provider/:owner',
        }),
      })

      const contextSwitcher = await screen.findAllByText('codecov')
      expect(contextSwitcher).not.toHaveLength(0)

      await user.click(contextSwitcher[0]!)

      const sentryOrg = await screen.findByRole('link', { name: 'sentry' })
      expect(sentryOrg).toBeInTheDocument()
      expect(sentryOrg).toHaveAttribute('href', '/account/gh/sentry')
    })
  })
})
