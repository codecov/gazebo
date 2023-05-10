import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import SentryTrialBanner from './SentryTrialBanner'

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

const sentryProMonth = {
  marketingName: 'Sentry Pro Team',
  value: 'users-sentrym',
  billingRate: 'monthly',
  baseUnitPrice: 12,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  trialDays: 14,
}

const sentryProYear = {
  marketingName: 'Sentry Pro Team',
  value: 'users-sentryy',
  billingRate: 'annually',
  baseUnitPrice: 10,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  trialDays: 14,
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

describe('SentryTrialBanner', () => {
  function setup(
    {
      includeSentryPlans = true,
      includeTimeStamp = null,
      isSentryPlan = false,
    }: {
      includeSentryPlans?: boolean
      includeTimeStamp?: number | null
      isSentryPlan?: boolean
    } = {
      includeSentryPlans: true,
      includeTimeStamp: null,
      isSentryPlan: false,
    }
  ) {
    server.use(
      rest.get('/internal/plans', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([
            ...(includeSentryPlans ? [sentryProMonth, sentryProYear] : []),
          ])
        )
      }),
      rest.get('/internal/gh/codecov/account-details/', (req, res, ctx) => {
        if (isSentryPlan) {
          return res(
            ctx.status(200),
            ctx.json({
              ...accountOne,
              plan: sentryProYear,
            })
          )
        }

        return res(
          ctx.status(200),
          ctx.json({
            ...accountOne,
            ...(includeTimeStamp
              ? {
                  subscriptionDetail: {
                    trialEnd: 123456,
                  },
                }
              : {}),
            plan: proPlanMonth,
          })
        )
      })
    )
  }

  describe('when owner is not present in path', () => {
    it('returns null', async () => {
      setup()

      const { container } = render(<SentryTrialBanner />, {
        wrapper: wrapper('/gh', '/:provider'),
      })

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })

  describe('when owner is present in the path', () => {
    describe('user is already on a trial', () => {
      it('returns null', async () => {
        setup({
          includeTimeStamp: 12345,
        })

        const { container } = render(<SentryTrialBanner />, {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(container).toBeEmptyDOMElement())
      })
    })

    describe('user is on a sentry plan', () => {
      it('returns null', async () => {
        setup({
          includeSentryPlans: true,
          isSentryPlan: true,
        })

        const { container } = render(<SentryTrialBanner />, {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(container).toBeEmptyDOMElement())
      })
    })

    describe('user has access to trial', () => {
      describe('renders banner', () => {
        beforeEach(() => {
          setup()
        })

        it('renders trial info', async () => {
          render(<SentryTrialBanner />, {
            wrapper: wrapper(),
          })

          const info = await screen.findByText(/Start your FREE/i)
          expect(info).toBeInTheDocument()
        })

        it('renders link to org upgrade page', async () => {
          render(<SentryTrialBanner />, {
            wrapper: wrapper(),
          })

          const link = await screen.findByRole('link', {
            name: /Start trial today/,
          })
          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
        })

        it('renders link to support', async () => {
          render(<SentryTrialBanner />, {
            wrapper: wrapper(),
          })

          const supportLink = await screen.findByRole('link', {
            name: /Support/,
          })
          expect(supportLink).toBeInTheDocument()
          expect(supportLink).toHaveAttribute(
            'href',
            'https://codecov.freshdesk.com/support/home'
          )
        })

        it('renders button link to org upgrade page', async () => {
          render(<SentryTrialBanner />, {
            wrapper: wrapper(),
          })

          const buttonLink = await screen.findByRole('link', {
            name: /Start Trial/,
          })
          expect(buttonLink).toBeInTheDocument()
          expect(buttonLink).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
        })
      })
    })
  })
})
