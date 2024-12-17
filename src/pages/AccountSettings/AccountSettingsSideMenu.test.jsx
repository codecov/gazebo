import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { Plans } from 'shared/utils/billing'

import AccountSettingsSideMenu from './AccountSettingsSideMenu'

vi.mock('config')

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Pro Team',
  monthlyUploadLimit: 250,
  value: Plans.USERS_BASIC,
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
})

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})

const wrapper =
  (
    { initialEntries = '/account/gh/codecov' } = {
      initialEntries: '/account/gh/codecov',
    }
  ) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/account/:provider/:owner">
          <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
        </Route>
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

describe('AccountSettingsSideMenu', () => {
  function setup(
    {
      isAdmin = false,
      username = 'codecov',
      owner = 'codecov',
      isSelfHosted = false,
      hideAccessTab = false,
      planValue = Plans.USERS_BASIC,
    } = {
      isAdmin: false,
      username: 'codecov',
      isSelfHosted: false,
      owner: 'codecov',
      hideAccessTab: false,
      planValue: Plans.USERS_BASIC,
    }
  ) {
    config.IS_SELF_HOSTED = isSelfHosted
    config.HIDE_ACCESS_TAB = hideAccessTab

    server.use(
      graphql.query('CurrentUser', () => {
        return HttpResponse.json({ data: mockCurrentUser(username) })
      }),
      graphql.query('DetailOwner', () => {
        return HttpResponse.json({
          data: { owner: { username: owner, isAdmin } },
        })
      }),
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: true,
              plan: {
                ...mockPlanData,
                value: planValue,
                isEnterprisePlan: planValue === Plans.USERS_ENTERPRISEM,
                isFreePlan: planValue === Plans.USERS_BASIC,
              },
            },
          },
        })
      })
    )
  }

  describe('running in self hosted mode', () => {
    describe('user is viewing their personal settings', () => {
      it('renders profile link', async () => {
        setup({ isSelfHosted: true })

        render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: 'Profile' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov')
      })

      describe('hide access tab is set to false', () => {
        it('renders access tab link', async () => {
          setup({ isSelfHosted: true })

          render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

          const link = await screen.findByRole('link', { name: 'Access' })
          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/account/gh/codecov/access')
        })
      })

      describe('hide access tab is set to true', () => {
        it('does not render access tab link', async () => {
          setup({ isSelfHosted: true, hideAccessTab: true })

          render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

          const suspense = await screen.findByText('Loading')
          expect(suspense).toBeInTheDocument()
          await waitFor(() =>
            expect(screen.queryByText('Loading')).not.toBeInTheDocument()
          )

          const link = screen.queryByRole('link', {
            name: 'Access',
          })
          expect(link).not.toBeInTheDocument()
        })
      })
    })

    describe('user is not viewing their personal settings', () => {
      it('does not render profile link', async () => {
        setup({ isSelfHosted: true })

        render(<AccountSettingsSideMenu />, {
          wrapper: wrapper({ initialEntries: '/account/gh/cool-new-user' }),
        })

        const suspense = await screen.findByText('Loading')
        expect(suspense).toBeInTheDocument()
        await waitFor(() =>
          expect(screen.queryByText('Loading')).not.toBeInTheDocument()
        )

        const link = screen.queryByRole('link', { name: 'Profile' })
        expect(link).not.toBeInTheDocument()
      })
    })

    it('renders yaml link', async () => {
      setup({ isSelfHosted: true })

      render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

      const link = await screen.findByRole('link', { name: 'Global YAML' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/account/gh/codecov/yaml')
    })

    describe('user is not an admin', () => {
      it('does not render org upload token link', async () => {
        setup({ isSelfHosted: true })

        render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

        const suspense = await screen.findByText('Loading')
        expect(suspense).toBeInTheDocument()
        await waitFor(() =>
          expect(screen.queryByText('Loading')).not.toBeInTheDocument()
        )

        const link = screen.queryByRole('link', { name: 'Global Upload Token' })
        expect(link).not.toBeInTheDocument()
      })
    })

    describe('user is an admin', () => {
      it('renders org upload token link', async () => {
        setup({ isSelfHosted: true, isAdmin: true })

        render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', {
          name: 'Global Upload Token',
        })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/account/gh/codecov/org-upload-token'
        )
      })
    })
  })

  describe('not running in self hosted mode', () => {
    describe('user is an admin', () => {
      it('renders admin link', async () => {
        setup({ isAdmin: true })

        render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: 'Admin' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov')
      })

      describe('user is viewing personal settings', () => {
        it('renders internal access link', async () => {
          setup({ isAdmin: true })

          render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

          const link = await screen.findByRole('link', { name: 'Access' })
          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/account/gh/codecov/access')
        })

        describe("okta access is displayed according to the user's plan", () => {
          it('displays okta access tab if user is on enterprise', async () => {
            setup({ isAdmin: true, planValue: Plans.USERS_ENTERPRISEM })

            render(<AccountSettingsSideMenu />, {
              wrapper: wrapper(),
            })

            const oktaAccessTab = await screen.findByText('Okta access')
            expect(oktaAccessTab).toBeInTheDocument()
          })

          it('does not display okta access tab if user is not on enterprise', async () => {
            setup({ isAdmin: true, planValue: 'free-plan' })

            render(<AccountSettingsSideMenu />, {
              wrapper: wrapper(),
            })

            await waitFor(() => queryClient.isFetching)
            await waitFor(() => !queryClient.isFetching)

            const oktaAccessTab = screen.queryByText('Okta access')
            expect(oktaAccessTab).not.toBeInTheDocument()
          })
        })
      })

      describe('user is not viewing personal settings', () => {
        it('does not render internal access link', async () => {
          setup({ isAdmin: true, username: 'cool-new-user' })

          render(<AccountSettingsSideMenu />, {
            wrapper: wrapper('/account/gh/cool-new-owner'),
          })

          const suspense = await screen.findByText('Loading')
          expect(suspense).toBeInTheDocument()
          await waitFor(() =>
            expect(screen.queryByText('Loading')).not.toBeInTheDocument()
          )

          const link = screen.queryByRole('link', { name: 'Access' })
          await waitFor(() => {
            expect(link).not.toBeInTheDocument()
          })
        })

        describe("okta access is displayed according to the user's plan", () => {
          it('displays okta access tab if user is on enterprise', async () => {
            setup({
              isAdmin: true,
              username: 'cool-new-user',
              planValue: Plans.USERS_ENTERPRISEM,
            })

            render(<AccountSettingsSideMenu />, {
              wrapper: wrapper('/account/gh/cool-new-user'),
            })

            const oktaAccessTab = await screen.findByText('Okta access')
            expect(oktaAccessTab).toBeInTheDocument()
          })

          it('does not display okta access tab if user is not on enterprise', async () => {
            setup({
              isAdmin: true,
              username: 'cool-new-user',
              planValue: 'free-plan',
            })

            render(<AccountSettingsSideMenu />, {
              wrapper: wrapper('/account/gh/cool-new-user'),
            })

            await waitFor(() => queryClient.isFetching)
            await waitFor(() => !queryClient.isFetching)

            const oktaAccessTab = screen.queryByText('Okta access')
            expect(oktaAccessTab).not.toBeInTheDocument()
          })
        })
      })

      it('renders yaml link', async () => {
        setup({ isAdmin: true })

        render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: 'Global YAML' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov/yaml')
      })

      it('renders org upload link', async () => {
        setup({ isAdmin: true })

        render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', {
          name: 'Global Upload Token',
        })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/account/gh/codecov/org-upload-token'
        )
      })
    })

    describe('user is not an admin', () => {
      describe('user is viewing personal settings', () => {
        it('renders internal access link', async () => {
          setup()

          render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

          const link = await screen.findByRole('link', { name: 'Access' })
          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/account/gh/codecov/access')
        })
      })

      describe("okta access is displayed according to the user's plan", () => {
        it('displays okta access tab if user is on enterprise', async () => {
          setup({ planValue: Plans.USERS_ENTERPRISEM })

          render(<AccountSettingsSideMenu />, {
            wrapper: wrapper(),
          })

          const oktaAccessTab = await screen.findByText('Okta access')
          expect(oktaAccessTab).toBeInTheDocument()
        })

        it('does not display okta access tab if user is not on enterprise', async () => {
          setup()

          render(<AccountSettingsSideMenu />, {
            wrapper: wrapper(),
          })

          await waitFor(() => queryClient.isFetching)
          await waitFor(() => !queryClient.isFetching)

          const oktaAccessTab = screen.queryByText('Okta access')
          expect(oktaAccessTab).not.toBeInTheDocument()
        })
      })

      describe('user is not viewing personal settings', () => {
        it('does not render internal access link', async () => {
          setup({ username: 'cool-new-owner' })

          render(<AccountSettingsSideMenu />, {
            wrapper: wrapper(),
          })

          const suspense = await screen.findByText('Loading')
          expect(suspense).toBeInTheDocument()
          await waitFor(() =>
            expect(screen.queryByText('Loading')).not.toBeInTheDocument()
          )

          const link = screen.queryByRole('link', { name: 'Access' })
          expect(link).not.toBeInTheDocument()
        })
      })

      it('renders yaml link', async () => {
        setup()

        render(<AccountSettingsSideMenu />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: 'Global YAML' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov/yaml')
      })
    })
  })
})
