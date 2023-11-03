import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import SpecialOffer from './SpecialOffer'

jest.mock('./TeamPlanCard', () => () => 'Team Plan Card')
jest.mock('shared/featureFlags')

const mockAvailablePlans = [
  {
    marketingName: 'Basic',
    value: 'users-basic',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: [
      'Up to 5 users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
    monthlyUploadLimit: 250,
  },
  {
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
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Pro Team',
    value: 'users-pr-inappy',
    billingRate: 'annually',
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Pro Team',
    value: 'users-enterprisem',
    billingRate: 'monthly',
    baseUnitPrice: 12,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Pro Team',
    value: 'users-enterprisey',
    billingRate: 'annually',
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
  },
  {
    baseUnitPrice: 6,
    benefits: ['Up to 10 users'],
    billingRate: 'monthly',
    marketingName: 'Users Team',
    monthlyUploadLimit: 2500,
    value: 'users-teamm',
  },
  {
    baseUnitPrice: 5,
    benefits: ['Up to 10 users'],
    billingRate: 'yearly',
    marketingName: 'Users Team',
    monthlyUploadLimit: 2500,
    value: 'users-teamy',
  },
]

const mockBody = jest.fn()
const mockToast = jest.fn()
jest.mock('services/toastNotification', () => ({
  useAddNotification: () => (data) => mockToast(data),
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
  logger: {
    error: () => {},
  },
})
const server = setupServer()

let testLocation
const wrapper =
  (initialEntries = '/plan/gh/codecov/cancel') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/plan/:provider/:owner/cancel">{children}</Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
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

describe('SpecialOffer', () => {
  function setup(
    { unsuccessfulReq = false, multipleTiers } = {
      unsuccessfulReq: false,
      multipleTiers: false,
    }
  ) {
    const user = userEvent.setup()
    useFlags.mockReturnValue({ multipleTiers })

    server.use(
      rest.patch(
        '/internal/gh/codecov/account-details',
        async (req, res, ctx) => {
          if (unsuccessfulReq) {
            return res(ctx.status(500))
          }

          const body = await req.json()
          mockBody(body)

          return res(ctx.status(200))
        }
      ),
      graphql.query('GetAvailablePlans', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ owner: { availablePlans: mockAvailablePlans } })
        )
      )
    )

    return { user }
  }

  describe('rendering component', () => {
    beforeEach(() => setup())

    it('renders header', () => {
      render(<SpecialOffer />, { wrapper: wrapper() })

      const header = screen.getByRole('heading', {
        name: "We'd love to keep you under our umbrella.",
      })
      expect(header).toBeInTheDocument()
    })

    it('renders first body text', () => {
      render(<SpecialOffer />, { wrapper: wrapper() })

      const body = screen.getByText(
        'Keep enjoying the features that help you analyze your code coverage quickly so you can deploy with confidence... for less.'
      )
      expect(body).toBeInTheDocument()
    })

    it('renders discount message', () => {
      render(<SpecialOffer />, { wrapper: wrapper() })

      const discountMessage = screen.getByText(
        'Get 30% off Codecov for 6 months! 🎉'
      )
      expect(discountMessage).toBeInTheDocument()
    })

    it('renders discount button', () => {
      render(<SpecialOffer />, { wrapper: wrapper() })

      const button = screen.getByRole('button', {
        name: "Yes, I'd like 6 months with 30% discount",
      })
      expect(button).toBeInTheDocument()
    })

    it('renders link to downgrade plan', () => {
      render(<SpecialOffer />, { wrapper: wrapper() })

      const link = screen.getByRole('link', {
        name: /No thanks, I'll proceed to the basic plan/,
      })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/gh/codecov/cancel/downgrade')
    })

    it('renders question with link to sales', () => {
      render(<SpecialOffer />, { wrapper: wrapper() })

      const paragraph = screen.getByText(/Questions\?/)
      expect(paragraph).toBeInTheDocument()

      const salesLink = screen.getByRole('link', { name: /Contact Sales/ })
      expect(salesLink).toBeInTheDocument()
      expect(salesLink).toHaveAttribute(
        'href',
        'https://about.codecov.io/sales'
      )
    })
  })

  describe('user accepts discount offer', () => {
    describe('discount is successfully applied', () => {
      it('passes the correct body', async () => {
        const { user } = setup()
        render(<SpecialOffer />, { wrapper: wrapper() })

        const button = screen.getByRole('button', {
          name: "Yes, I'd like 6 months with 30% discount",
        })
        expect(button).toBeInTheDocument()

        await user.click(button)

        await waitFor(() =>
          expect(mockBody).toBeCalledWith({ apply_cancellation_discount: true })
        )
      })

      it('renders a success toast', async () => {
        const { user } = setup()
        render(<SpecialOffer />, { wrapper: wrapper() })

        const button = screen.getByRole('button', {
          name: "Yes, I'd like 6 months with 30% discount",
        })
        expect(button).toBeInTheDocument()

        await user.click(button)

        await waitFor(() =>
          expect(mockToast).toBeCalledWith({
            type: 'success',
            text: 'Discount successfully applied.',
          })
        )
      })

      it('redirects the user to the org page', async () => {
        const { user } = setup()
        render(<SpecialOffer />, { wrapper: wrapper() })

        const button = screen.getByRole('button', {
          name: "Yes, I'd like 6 months with 30% discount",
        })
        expect(button).toBeInTheDocument()

        await user.click(button)

        await waitFor(() => expect(testLocation.pathname).toBe('/gh/codecov'))
      })
    })

    describe('discount is not successfully applied', () => {
      it('renders an error toast', async () => {
        const { user } = setup({ unsuccessfulReq: true })
        render(<SpecialOffer />, { wrapper: wrapper() })

        const button = screen.getByRole('button', {
          name: "Yes, I'd like 6 months with 30% discount",
        })
        expect(button).toBeInTheDocument()

        await user.click(button)

        await waitFor(() =>
          expect(mockToast).toBeCalledWith({
            type: 'error',
            text: 'Something went wrong while applying discount.',
          })
        )
      })
    })
  })

  describe('user continues with downgrade', () => {
    it('navigates to downgrade page', async () => {
      const { user } = setup({ unsuccessfulReq: true })
      render(<SpecialOffer />, { wrapper: wrapper() })

      const link = screen.getByRole('link', {
        name: /No thanks, I'll proceed to the basic plan/,
      })
      expect(link).toBeInTheDocument()

      expect(testLocation.pathname).toBe('/plan/gh/codecov/cancel')

      await user.click(link)

      expect(testLocation.pathname).toBe('/plan/gh/codecov/cancel/downgrade')
    })
  })

  describe('user can downgrade to team plan', () => {
    it('renders the header', async () => {
      setup({ multipleTiers: true })
      render(<SpecialOffer />, { wrapper: wrapper() })

      const header = await screen.findByRole('heading', {
        name: 'Alternative plan offer',
      })
      expect(header).toBeInTheDocument()
    })

    it('renders team plan card', async () => {
      setup({ multipleTiers: true })
      render(<SpecialOffer />, { wrapper: wrapper() })

      const teamPlanCard = await screen.findByText('Team Plan Card')
      expect(teamPlanCard).toBeInTheDocument()
    })

    it('renders link to change plan', async () => {
      setup({ multipleTiers: true })
      render(<SpecialOffer />, { wrapper: wrapper() })

      const link = await screen.findByRole('link', {
        name: /No thanks, I'll proceed with cancellation/,
      })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/gh/codecov/cancel/downgrade')
    })
  })
})
