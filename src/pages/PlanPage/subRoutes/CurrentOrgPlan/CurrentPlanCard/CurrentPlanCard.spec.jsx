import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CurrentPlanCard from './CurrentPlanCard'

jest.mock('./FreePlanCard', () => () => 'Free plan card')
jest.mock('./ProPlanCard', () => () => 'Pro plan card')
jest.mock('./EnterprisePlanCard', () => () => 'Enterprise plan card')

const proPlanDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configureable # of users', 'Unlimited repos'],
    quantity: 5,
    value: 'users-inappm',
  },
}

const freePlanDetails = {
  plan: {
    marketingName: 'Basic',
    value: 'users-free',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: [
      'Up to 5 users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
  },
}

const enterprisePlan = {
  plan: {
    marketingName: 'Enterprise',
    value: 'users-enterprisey',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: [
      'Unlimited users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/bb/critical-role']}>
      <Route path="/plan/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('CurrentPlanCard', () => {
  function setup(planDetails = freePlanDetails) {
    server.use(
      rest.get('/internal/bb/critical-role/account-details/', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(planDetails))
      )
    )
  }

  describe('When rendered with free plan', () => {
    beforeEach(() => {
      setup()
    })
    it('renders the correct plan card', async () => {
      render(<CurrentPlanCard />, {
        wrapper,
      })

      expect(await screen.findByText(/Free plan card/)).toBeInTheDocument()
    })
  })

  describe('When rendered with pro plan', () => {
    beforeEach(() => {
      setup(proPlanDetails)
    })
    it('renders the correct plan card', async () => {
      render(<CurrentPlanCard />, {
        wrapper,
      })

      expect(await screen.findByText(/Pro plan card/)).toBeInTheDocument()
    })
  })

  describe('When rendered with enterprise plan', () => {
    beforeEach(() => {
      setup(enterprisePlan)
    })
    it('renders the correct plan card', async () => {
      render(<CurrentPlanCard />, {
        wrapper,
      })

      expect(
        await screen.findByText(/Enterprise plan card/)
      ).toBeInTheDocument()
    })
  })
})
