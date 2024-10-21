import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ActivationAlert from './ActivationAlert'

vi.mock('./FreePlanSeatsTakenAlert', () => ({
  default: () => 'FreePlanSeatsTakenAlert',
}))
vi.mock('./PaidPlanSeatsTakenAlert', () => ({
  default: () => 'PaidPlanSeatsTakenAlert',
}))
vi.mock('./ActivationRequiredAlert', () => ({
  default: () => 'ActivationRequiredAlert',
}))
vi.mock('./UnauthorizedRepoDisplay', () => ({
  default: () => 'UnauthorizedRepoDisplay',
}))

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

describe('ActivationAlert', () => {
  function setup(
    privateRepos = true,
    value = 'users-basic',
    hasSeatsLeft = true
  ) {
    server.use(
      graphql.query('GetPlanData', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: privateRepos,
              plan: {
                ...mockTrialData,
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
          },
        })
      })
    )
  }

  it('defaults to render unauthorized repo access', async () => {
    setup()
    render(<ActivationAlert />, { wrapper })

    const unauthorizedRepoDisplay = await screen.findByText(
      /UnauthorizedRepoDisplay/
    )
    expect(unauthorizedRepoDisplay).toBeInTheDocument()
  })

  it('renders FreePlanSeatsTakenAlert when on free plan and no seats left', async () => {
    setup(false, 'users-basic', false)
    render(<ActivationAlert />, { wrapper })

    const freePlanSeatsTakenAlert = await screen.findByText(
      /FreePlanSeatsTakenAlert/
    )
    expect(freePlanSeatsTakenAlert).toBeInTheDocument()
  })

  it('renders PaidPlanSeatsTakenAlert when on paid plan and no seats left', async () => {
    setup(false, 'users-pro', false)
    render(<ActivationAlert />, { wrapper })

    const paidPlanSeatsTakenAlert = await screen.findByText(
      /PaidPlanSeatsTakenAlert/
    )
    expect(paidPlanSeatsTakenAlert).toBeInTheDocument()
  })

  it('renders ActivationRequiredAlert when on paid plan and some seats left', async () => {
    setup(false, 'users-pro', true)
    render(<ActivationAlert />, { wrapper })

    const activationRequiredAlert = await screen.findByText(
      /ActivationRequiredAlert/
    )
    expect(activationRequiredAlert).toBeInTheDocument()
  })
})
