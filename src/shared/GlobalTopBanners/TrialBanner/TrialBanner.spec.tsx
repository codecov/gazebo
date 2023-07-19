import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/trial'
import { useFlags } from 'shared/featureFlags'

import TrialBanner from './TrialBanner'

jest.mock('shared/featureFlags')

const mockedUseFlags = useFlags as jest.Mock<{ codecovTrialMvp: boolean }>

const accountOne = {
  integrationId: null,
  activatedStudentCount: 0,
  activatedUserCount: 0,
  checkoutSessionId: null,
  email: 'codecov-user@codecov.io',
  inactiveUserCount: 0,
  name: 'codecov-user',
  nbActivePrivateRepos: 1,
  planAutoActivate: true,
  planProvider: null,
  repoTotalCredits: 99999999,
  rootOrganization: null,
  scheduleDetail: null,
  studentCount: 0,
  subscriptionDetail: null,
}

const proPlanMonth = {
  marketingName: 'Pro Team',
  value: 'users-pr-inappm',
  billingRate: 'monthly',
  baseUnitPrice: 12,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  quantity: 10,
}

const trialPlan = {
  marketingName: 'Trial Team',
  value: 'users-trial',
  billingRate: 'monthly',
  baseUnitPrice: 12,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  quantity: 10,
}

const basicPlan = {
  marketingName: 'Basic',
  value: 'users-basic',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Up to 1 user',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
  quantity: 1,
}

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (
    initialEntries = '/gh/codecov',
    path = '/:provider/:owner'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path={path}>
            <Suspense fallback="Loading...">{children}</Suspense>
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

interface SetupArgs {
  trialStatus?: keyof typeof TrialStatuses
  isSentryPlan?: boolean
  flagValue?: boolean
  isCurrentUserPartOfOrg?: boolean
  isTrialPlan?: boolean
  isProPlan?: boolean
}

describe('TrialBanner', () => {
  function setup({
    trialStatus = TrialStatuses.NOT_STARTED,
    flagValue = false,
    isCurrentUserPartOfOrg = false,
    isTrialPlan = false,
    isProPlan = false,
  }: SetupArgs) {
    const user = userEvent.setup()

    mockedUseFlags.mockReturnValue({
      codecovTrialMvp: flagValue,
    })

    server.use(
      graphql.query('GetTrialData', (_, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: { trialStatus },
          })
        )
      ),
      graphql.query('DetailOwner', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({ owner: { isCurrentUserPartOfOrg } })
        )
      }),
      rest.get('/internal/gh/:owner/account-details/', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            ...accountOne,
            plan: isTrialPlan
              ? trialPlan
              : isProPlan
              ? proPlanMonth
              : basicPlan,
          })
        )
      })
    )

    return {
      user,
    }
  }

  describe('when flag is enabled', () => {
    describe('owner is undefined', () => {
      it('renders nothing', async () => {
        setup({ flagValue: true })

        const { container } = render(<TrialBanner />, {
          wrapper: wrapper('/gh', '/:provider'),
        })

        expect(container).toBeEmptyDOMElement()
      })
    })

    describe('owner does not belong to org', () => {
      it('renders nothing', async () => {
        setup({ flagValue: true, isCurrentUserPartOfOrg: false })

        const { container } = render(<TrialBanner />, {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
        await waitFor(() => expect(queryClient.isFetching()).toBe(0))

        expect(container).toBeEmptyDOMElement()
      })
    })

    describe('trial is ongoing', () => {
      describe('user is on a free plan', () => {
        it('renders nothing', async () => {
          setup({
            flagValue: true,
            trialStatus: TrialStatuses.ONGOING,
            isCurrentUserPartOfOrg: true,
          })

          const { container } = render(<TrialBanner />, {
            wrapper: wrapper(),
          })

          await waitFor(() =>
            expect(queryClient.isFetching()).toBeGreaterThan(0)
          )
          await waitFor(() => expect(queryClient.isFetching()).toBe(0))

          expect(container).toBeEmptyDOMElement()
        })
      })

      describe('trial is ongoing', () => {
        describe('date diff is less then 4', () => {
          it('renders ongoing banner', async () => {})
        })

        describe('date diff is greater then 4', () => {
          it('renders nothing', async () => {})
        })
      })
    })

    describe('trial is expired', () => {
      describe('user is on a free plan', () => {
        it('renders expired banner', async () => {
          setup({
            flagValue: true,
            trialStatus: TrialStatuses.EXPIRED,
            isCurrentUserPartOfOrg: true,
          })

          render(<TrialBanner />, {
            wrapper: wrapper(),
          })

          const banner = await screen.findByText(
            /The org's 14-day free Codecov Pro trial has ended./
          )
          expect(banner).toBeInTheDocument()
        })
      })

      describe('user is on a paid plan', () => {
        it('renders nothing', async () => {
          setup({
            flagValue: true,
            isProPlan: true,
            trialStatus: TrialStatuses.EXPIRED,
            isCurrentUserPartOfOrg: true,
          })

          const { container } = render(<TrialBanner />, {
            wrapper: wrapper(),
          })

          await waitFor(() =>
            expect(queryClient.isFetching()).toBeGreaterThan(0)
          )
          await waitFor(() => expect(queryClient.isFetching()).toBe(0))

          expect(container).toBeEmptyDOMElement()
        })
      })
    })
  })

  describe('when flag is disabled', () => {
    it('displays nothing', async () => {
      setup({ flagValue: false })

      const { container } = render(<TrialBanner />, { wrapper: wrapper() })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      expect(container).toBeEmptyDOMElement()
    })
  })
})
