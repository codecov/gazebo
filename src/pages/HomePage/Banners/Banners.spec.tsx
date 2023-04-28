import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import Banners from './Banners'

type PlansType = (typeof Plans)[keyof typeof Plans]

const accountDetails = (planName: PlansType = Plans.USERS_BASIC) => ({
  plan: {
    marketingName: planName,
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 5,
    value: 'users-inappm',
  },
  activatedUserCount: 2,
  inactiveUserCount: 1,
})

const userData = {
  username: 'codecov-user',
  email: 'codecov-user@codecov.io',
  name: 'codecov',
  avatarUrl: 'photo',
  onboardingCompleted: false,
}

const plans = [
  {
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
  },
]

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/:owner">
        <Suspense fallback={null}>{children}</Suspense>
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

describe('Banners', () => {
  function setup(
    { planName = Plans.USERS_PR_INAPPM }: { planName: PlansType } = {
      planName: Plans.USERS_PR_INAPPM,
    }
  ) {
    const user = userEvent.setup()
    const mockSetItem = jest.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = jest.spyOn(window.localStorage.__proto__, 'getItem')

    server.use(
      rest.get('/internal/plans', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(plans))
      ),
      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ me: userData }))
      }),
      rest.get(
        `/internal/:provider/:owner/account-details/`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(accountDetails(planName)))
        }
      )
    )

    return { user, mockSetItem, mockGetItem }
  }

  afterEach(() => jest.resetAllMocks())

  describe('renders sentry bundle banner', () => {
    it('renders the banner', async () => {
      setup()

      render(<Banners />, { wrapper })

      const heading = await screen.findByText(/Sentry Bundle Benefit/)
      expect(heading).toBeInTheDocument()
    })
  })
})
