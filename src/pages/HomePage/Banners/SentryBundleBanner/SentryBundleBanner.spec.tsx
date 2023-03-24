import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import SentryBundleBanner from './SentryBundleBanner'

type PlansType = (typeof Plans)[keyof typeof Plans]

const accountDetails = (planName: PlansType = Plans.USERS_SENTRYM) => ({
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

describe('SentryBundleBanner', () => {
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

  describe('user can apply sentry upgrade and has not hidden the banner', () => {
    it('renders the banner', async () => {
      setup()

      render(<SentryBundleBanner />, { wrapper })

      const heading = await screen.findByText(/Sentry Bundle Benefit/)
      expect(heading).toBeInTheDocument()
    })
  })

  describe('user interacts dismisses the banner', () => {
    it('renders null', async () => {
      const { user } = setup()

      const { container } = render(<SentryBundleBanner />, {
        wrapper,
      })

      const dismissButton = await screen.findByRole('button', {
        name: 'Dismiss banner',
      })
      await user.click(dismissButton)

      expect(container).toBeEmptyDOMElement()
    })

    it('sets local storage value', async () => {
      const { user, mockSetItem } = setup()

      render(<SentryBundleBanner />, {
        wrapper,
      })

      const dismissButton = await screen.findByRole('button', {
        name: 'Dismiss banner',
      })
      await user.click(dismissButton)

      await waitFor(() => expect(mockSetItem).toBeCalled())
      await waitFor(() =>
        expect(mockSetItem).toBeCalledWith('show-sentry-bundle-banner', 'false')
      )
    })
  })

  describe('when the user has hidden the banner', () => {
    it('renders null', async () => {
      const { mockGetItem } = setup()

      mockGetItem.mockReturnValue('false')

      const { container } = render(<SentryBundleBanner />, { wrapper })

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })

  describe('when the user is on a monthly sentry plan', () => {
    it('renders null', async () => {
      setup({ planName: Plans.USERS_SENTRYM })

      const { container } = render(<SentryBundleBanner />, { wrapper })

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })

  describe('when the user is on an annual sentry plan', () => {
    it('renders null', async () => {
      setup({ planName: Plans.USERS_SENTRYY })

      const { container } = render(<SentryBundleBanner />, { wrapper })

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })

  describe('when the user is on an enterprise plan', () => {
    it('renders null', async () => {
      setup({ planName: Plans.USERS_ENTERPRISEM })

      const { container } = render(<SentryBundleBanner />, { wrapper })

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })
})
