import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'

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

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  planName: 'users-basic',
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
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
      ongoingTrial = null,
      isSentryPlan = false,
    }: {
      includeSentryPlans?: boolean
      ongoingTrial?: boolean | null
      isSentryPlan?: boolean
    } = {
      includeSentryPlans: true,
      ongoingTrial: null,
      isSentryPlan: false,
    }
  ) {
    const user = userEvent.setup()
    const mockSetItem = jest.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = jest.spyOn(window.localStorage.__proto__, 'getItem')

    server.use(
      graphql.query('GetPlanData', (_, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              plan: {
                ...mockPlanData,
                trialStatus: ongoingTrial ? 'ONGOING' : 'NOT_STARTED',
              },
            },
          })
        )
      ),
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
            plan: proPlanMonth,
          })
        )
      })
    )

    return {
      user,
      mockSetItem,
      mockGetItem,
    }
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
          ongoingTrial: true,
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
        it('renders trial info', async () => {
          setup()

          render(<SentryTrialBanner />, {
            wrapper: wrapper(),
          })

          const info = await screen.findByText(
            /Start your 14-day free Codecov Pro trial today./i
          )
          expect(info).toBeInTheDocument()
        })

        it('renders button link to org upgrade page', async () => {
          setup()

          render(<SentryTrialBanner />, {
            wrapper: wrapper(),
          })

          const buttonLink = await screen.findByRole('link', {
            name: /Start Trial/,
          })
          expect(buttonLink).toBeInTheDocument()
          expect(buttonLink).toHaveAttribute('href', '/plan/gh/codecov')
        })

        it('renders dismiss button', async () => {
          setup()

          render(<SentryTrialBanner />, {
            wrapper: wrapper(),
          })

          const dismissButton = await screen.findByRole('button', {
            name: 'x.svg',
          })
          expect(dismissButton).toBeInTheDocument()
        })

        describe('user dismisses banner', () => {
          it('calls local storage', async () => {
            const { user, mockGetItem, mockSetItem } = setup()

            mockGetItem.mockReturnValue(null)

            render(<SentryTrialBanner />, {
              wrapper: wrapper(),
            })

            const dismissButton = await screen.findByRole('button', {
              name: 'x.svg',
            })
            expect(dismissButton).toBeInTheDocument()
            await user.click(dismissButton)

            await waitFor(() =>
              expect(mockSetItem).toBeCalledWith(
                'dismissed-top-banners',
                JSON.stringify({ 'global-top-sentry-banner': 'true' })
              )
            )
          })

          it('hides the banner', async () => {
            const { user, mockGetItem } = setup()

            mockGetItem.mockReturnValue(null)

            const { container } = render(<SentryTrialBanner />, {
              wrapper: wrapper(),
            })

            const dismissButton = await screen.findByRole('button', {
              name: 'x.svg',
            })
            expect(dismissButton).toBeInTheDocument()
            await user.click(dismissButton)

            await waitFor(() => expect(container).toBeEmptyDOMElement())
          })
        })
      })
    })
  })
})
