import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ActivationBanner from './ActivationBanner'

jest.mock('./TrialEligibleBanner', () => () => 'TrialEligibleBanner')

const queryClient = new QueryClient()

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
      <Route path="/:provider/:owner/:repo/new">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()

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

const mockTrialData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  value: 'users-basic',
  trialStatus: 'ONGOING',
  trialStartDate: '2023-01-01T08:55:25',
  trialEndDate: '2023-01-10T08:55:25',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
}

describe('ActivationBanner', () => {
  function setup(
    privateRepos = true,
    trialStatus = 'NOT_STARTED',
    value = 'users-basic'
  ) {
    server.use(
      graphql.query('GetPlanData', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              hasPrivateRepos: privateRepos,
              plan: {
                ...mockTrialData,
                trialStatus,
                value,
              },
              pretrialPlan: {
                baseUnitPrice: 10,
                benefits: [],
                billingRate: 'monthly',
                marketingName: 'Users Basic',
                monthlyUploadLimit: 250,
                value: 'users-basic',
              },
            },
          })
        )
      })
    )
  }

  it('renders trial eligible banner if user is eligible to trial', async () => {
    setup()
    render(<ActivationBanner />, { wrapper })

    const trialEligibleBanner = await screen.findByText(/TrialEligibleBanner/)
    expect(trialEligibleBanner).toBeInTheDocument()
  })

  it('does not render trial eligible banner if user is not eligible to trial', () => {
    setup(false)
    render(<ActivationBanner />, { wrapper })

    const trialEligibleBanner = screen.queryByText(/TrialEligibleBanner/)
    expect(trialEligibleBanner).not.toBeInTheDocument()
  })
})
