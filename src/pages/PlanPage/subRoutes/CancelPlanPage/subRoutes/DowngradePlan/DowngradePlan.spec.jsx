import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import DowngradePlan from './DowngradePlan'

const mockAccountDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 5,
    value: 'users-inappm',
  },
  activatedUserCount: 2,
  inactiveUserCount: 1,
  subscriptionDetail: {
    currentPeriodEnd: 1638614662,
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
})
const server = setupServer()

const wrapper =
  (initialEntries = '/plan/gh/codecov/cancel/downgrade') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/plan/:provider/:owner/cancel/downgrade">
          <Suspense fallback={null}>{children}</Suspense>
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

describe('DowngradePlan', () => {
  function setup() {
    server.use(
      rest.all('/internal/gh/codecov/account-details', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(mockAccountDetails))
      )
    )
  }

  describe('rendering component', () => {
    beforeEach(() => setup())

    it('renders title', async () => {
      render(<DowngradePlan />, { wrapper: wrapper() })

      const title = await screen.findByText('Plan cancellation')
      expect(title).toBeInTheDocument()
    })

    it('renders first body', async () => {
      render(<DowngradePlan />, { wrapper: wrapper() })

      const body = await screen.findByText(/Canceling your paid plan means/)
      expect(body).toBeInTheDocument()
    })

    it('renders list', async () => {
      render(<DowngradePlan />, { wrapper: wrapper() })

      const numberOfUsers = await screen.findByText(
        'Configurable number of users'
      )
      expect(numberOfUsers).toBeInTheDocument()

      const techSupport = await screen.findByText('Technical support')
      expect(techSupport).toBeInTheDocument()

      const uploads = await screen.findByText('Unlimited private repo uploads')
      expect(uploads).toBeInTheDocument()
    })

    it('renders second body', async () => {
      render(<DowngradePlan />, { wrapper: wrapper() })

      const bodyText1 = await screen.findByText(/You currently have/)
      const bodyText2 = await screen.findByText(/2/)
      const bodyText3 = await screen.findByText(/active users. On downgrade,/)
      expect(bodyText1).toBeInTheDocument()
      expect(bodyText2).toBeInTheDocument()
      expect(bodyText3).toBeInTheDocument()
    })

    it('renders downgrade button', async () => {
      render(<DowngradePlan />, { wrapper: wrapper() })

      const button = await screen.findByRole('button', {
        name: 'Cancel your plan',
      })
      expect(button).toBeInTheDocument()
    })
  })
})
