import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import TeamPlanCard from './TeamPlanCard'

vi.mock('shared/plan/BenefitList', () => ({ default: () => 'BenefitsList' }))

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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()

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

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/bb/critical-role']}>
      <Route path="/plan/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('TeamPlanCard', () => {
  function setup() {
    server.use(
      graphql.query('GetAvailablePlans', (info) => {
        return HttpResponse.json({
          data: { owner: { availablePlans: mockAvailablePlans } },
        })
      })
    )
  }

  it('shows the monthly marketing name', async () => {
    setup()
    render(<TeamPlanCard />, {
      wrapper,
    })

    const marketingName = await screen.findByText(/Users Team/)
    expect(marketingName).toBeInTheDocument()
  })

  it('show the benefits list', async () => {
    setup()

    render(<TeamPlanCard />, {
      wrapper,
    })

    const benefitsIncludes = await screen.findByText(/Includes/)
    expect(benefitsIncludes).toBeInTheDocument()

    const benefitsList = await screen.findByText(/BenefitsList/)
    expect(benefitsList).toBeInTheDocument()
  })

  it('shows pricing for monthly card', async () => {
    setup()

    render(<TeamPlanCard />, {
      wrapper,
    })

    const yearlyPrice = await screen.findByText(/5/)
    expect(yearlyPrice).toBeInTheDocument()

    const monthlyPrice = await screen.findByText(/6/)
    expect(monthlyPrice).toBeInTheDocument()

    const auxiliaryText = await screen.findByText(/per user billing monthly/)
    expect(auxiliaryText).toBeInTheDocument()
  })

  it('shows action button', async () => {
    setup()

    render(<TeamPlanCard />, {
      wrapper,
    })

    const actionButton = await screen.findByRole('link', {
      name: /Change to Team plan/,
    })
    expect(actionButton).toBeInTheDocument()
    expect(actionButton).toHaveAttribute(
      'href',
      '/plan/bb/critical-role/upgrade?plan=team'
    )
  })
})
