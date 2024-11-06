import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import AccountSettings from './AccountSettings'

vi.mock('config')

vi.mock('./shared/Header', () => ({ default: () => 'Header' }))
vi.mock('./AccountSettingsSideMenu', () => ({
  default: () => 'AccountSettingsSideMenu',
}))
vi.mock('./tabs/Access', () => ({ default: () => 'Access' }))
vi.mock('./tabs/Admin', () => ({ default: () => 'Admin' }))
vi.mock('../NotFound', () => ({ default: () => 'NotFound' }))
vi.mock('./tabs/OrgUploadToken', () => ({ default: () => 'OrgUploadToken' }))
vi.mock('./tabs/Profile', () => ({ default: () => 'Profile' }))
vi.mock('./tabs/YAML', () => ({ default: () => 'YAML' }))
vi.mock('./tabs/OktaAccess', () => ({ default: () => 'OktaAccess' }))

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Pro Team',
  monthlyUploadLimit: 250,
  value: 'free-plan',
  trialStatus: 'NOT_STARTED',
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
}

const mockCurrentUser = (username) => ({
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
      username,
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
})

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true, retry: false } },
})

const wrapper =
  (
    {
      initialEntries = '/account/gh/codecov',
      path = '/account/:provider/:owner',
    } = {
      initialEntries: '/account/gh/codecov',
      path: '/account/:provider/:owner',
    }
  ) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path={path}>
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('AccountSettings', () => {
  function setup(
    {
      isSelfHosted = false,
      owner = 'codecov',
      username = 'codecov',
      isAdmin = false,
      hideAccessTab = true,
      planValue = 'free-plan',
    } = {
      isSelfHosted: false,
      owner: 'codecov',
      username: 'codecov',
      isAdmin: false,
      hideAccessTab: true,
      planValue: 'free-plan',
    }
  ) {
    config.IS_SELF_HOSTED = isSelfHosted
    config.HIDE_ACCESS_TAB = hideAccessTab

    server.use(
      graphql.query('CurrentUser', (info) => {
        return HttpResponse.json({ data: mockCurrentUser(username) })
      }),
      graphql.query('DetailOwner', (info) => {
        return HttpResponse.json({
          data: { owner: { username: owner, isAdmin } },
        })
      }),
      graphql.query('GetPlanData', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: true,
              plan: {
                ...mockPlanData,
                value: planValue,
              },
            },
          },
        })
      })
    )
  }

  describe('on root route', () => {
    describe('is self hosted', () => {
      describe('user is viewing personal settings', () => {
        it('displays profile tab', async () => {
          setup({ isSelfHosted: true })

          render(<AccountSettings />, {
            wrapper: wrapper(),
          })

          const profileTab = await screen.findByText('Profile')
          expect(profileTab).toBeInTheDocument()
        })
      })

      describe('user is not viewing personal settings', () => {
        it('redirects the user to the yaml tab', async () => {
          setup({ isSelfHosted: true, username: 'cool-user' })

          render(<AccountSettings />, {
            wrapper: wrapper(),
          })

          const yamlTab = await screen.findByText('YAML')
          expect(yamlTab).toBeInTheDocument()
        })
      })
    })

    describe('is not self hosted', () => {
      describe('user is an admin', () => {
        it('displays the admin tab', async () => {
          setup({ isAdmin: true, username: 'cool-user' })

          render(<AccountSettings />, {
            wrapper: wrapper(),
          })

          const adminTab = await screen.findByText('Admin')
          expect(adminTab).toBeInTheDocument()
        })
      })

      describe('user is not an admin', () => {
        it('redirects user to yaml tab', async () => {
          setup({ isAdmin: false, username: 'cool-user' })

          render(<AccountSettings />, {
            wrapper: wrapper(),
          })

          const yamlTab = await screen.findByText('YAML')
          expect(yamlTab).toBeInTheDocument()
        })
      })
    })

    it('redirects the user to the yaml tab', async () => {
      setup()

      render(<AccountSettings />, {
        wrapper: wrapper(),
      })

      const yamlTab = await screen.findByText('YAML')
      expect(yamlTab).toBeInTheDocument()
    })
  })

  describe('on the yaml route', () => {
    it('renders the yaml tab', async () => {
      setup()

      render(<AccountSettings />, {
        wrapper: wrapper({
          initialEntries: '/account/gh/codecov/yaml',
          path: '/account/:provider/:owner/yaml',
        }),
      })

      const yamlTab = await screen.findByText('YAML')
      expect(yamlTab).toBeInTheDocument()
    })
  })

  describe('on the access route', () => {
    describe('is self hosted', () => {
      describe('hide access tab is set to false', () => {
        it('renders access tab', async () => {
          setup({ isSelfHosted: true, hideAccessTab: false })

          render(<AccountSettings />, {
            wrapper: wrapper({
              initialEntries: '/account/gh/codecov/access',
              path: '/account/:provider/:owner/access',
            }),
          })

          const accessTab = await screen.findByText('Access')
          expect(accessTab).toBeInTheDocument()
        })
      })

      describe('hide access tab is set to true', () => {
        it('renders not found tab', async () => {
          setup({ isSelfHosted: true, hideAccessTab: true })

          render(<AccountSettings />, {
            wrapper: wrapper({
              initialEntries: '/account/gh/codecov/access',
              path: '/account/:provider/:owner/access',
            }),
          })

          const notFound = await screen.findByText('NotFound')
          expect(notFound).toBeInTheDocument()
        })
      })
    })

    describe('is not self hosted', () => {
      describe('hide access tab is set to false', () => {
        it('renders access tab', async () => {
          setup({ isSelfHosted: false, hideAccessTab: false })

          render(<AccountSettings />, {
            wrapper: wrapper({
              initialEntries: '/account/gh/codecov/access',
              path: '/account/:provider/:owner/access',
            }),
          })

          const accessTab = await screen.findByText('Access')
          expect(accessTab).toBeInTheDocument()
        })
      })
      describe('hide access tab is set to true', () => {
        it('renders access tab', async () => {
          setup({ isSelfHosted: false, hideAccessTab: true })

          render(<AccountSettings />, {
            wrapper: wrapper({
              initialEntries: '/account/gh/codecov/access',
              path: '/account/:provider/:owner/access',
            }),
          })

          const accessTab = await screen.findByText('Access')
          expect(accessTab).toBeInTheDocument()
        })
      })
    })
  })

  describe('on org upload token route', () => {
    describe('user is an admin', () => {
      it('renders org upload token tab', async () => {
        setup({ isAdmin: true, username: 'cool-user' })

        render(<AccountSettings />, {
          wrapper: wrapper({
            initialEntries: '/account/gh/codecov/org-upload-token',
            path: '/account/:provider/:owner/org-upload-token',
          }),
        })

        const orgUploadTab = await screen.findByText('OrgUploadToken')
        expect(orgUploadTab).toBeInTheDocument()
      })
    })

    describe('user is not an admin', () => {
      it('redirects user to yaml tab', async () => {
        setup({ isAdmin: false, username: 'cool-user' })

        render(<AccountSettings />, {
          wrapper: wrapper({
            initialEntries: '/account/gh/codecov/org-upload-token',
          }),
        })

        const yamlTab = await screen.findByText('YAML')
        expect(yamlTab).toBeInTheDocument()
      })
    })
  })

  describe('on okta access route', () => {
    it('renders okta access tab for enterprise users', async () => {
      setup({
        planValue: 'users-enterprisem',
        isSelfHosted: false,
      })

      render(<AccountSettings />, {
        wrapper: wrapper({
          initialEntries: '/account/gh/codecov/okta-access',
          path: '/account/:provider/:owner/okta-access',
        }),
      })

      const oktaAccessTab = await screen.findByText('OktaAccess')
      expect(oktaAccessTab).toBeInTheDocument()
    })

    it('does not render okta access tab for non-enterprise users', async () => {
      setup()

      render(<AccountSettings />, {
        wrapper: wrapper({
          initialEntries: '/account/gh/codecov/okta-access',
          path: '/account/:provider/:owner/okta-access',
        }),
      })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const oktaAccessTab = screen.queryByText('OktaAccess')
      expect(oktaAccessTab).not.toBeInTheDocument()
    })
  })
})
