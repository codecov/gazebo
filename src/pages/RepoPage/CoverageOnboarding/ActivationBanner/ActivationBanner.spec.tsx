import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ActivationBanner from './ActivationBanner'

jest.mock('./TrialEligibleBanner', () => () => 'TrialEligibleBanner')
jest.mock('./FreePlanSeatsLimitBanner', () => () => 'FreePlanSeatsLimitBanner')


const queryClient = new QueryClient()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
  hasSeatsLeft: true,
}

describe('ActivationBanner', () => {
  function setup(
    privateRepos = true,
    trialStatus = 'NOT_STARTED',
    value = 'users-basic',
    hasSeatsLeft = true
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
                hasSeatsLeft,
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

  it('does not render trial eligible banner if user is not eligible to trial', async () => {
    setup(false, 'ONGOING', 'users-basic', true)
    const { container } = render(<ActivationBanner />, { wrapper })

    await waitFor(() => queryClient.isFetching)
    await waitFor(() => !queryClient.isFetching)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders seats limit reached banner if user has no seats left', async () => {
    setup(true, 'ONGOING', 'users-basic', false)
    render(<ActivationBanner />, { wrapper })

    const FreePlanSeatsLimitBanner = await screen.findByText(
      /FreePlanSeatsLimitBanner/
    )
    expect(FreePlanSeatsLimitBanner).toBeInTheDocument()
  })
})
