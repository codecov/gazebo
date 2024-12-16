import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { BillingRate, Plans } from 'shared/utils/billing'

import Activation from './Activation'

vi.mock('./ChangePlanLink', () => ({
  default: vi.fn(() => 'ChangePlanLink'),
}))

const mockedAccountDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 9,
    value: Plans.USERS_BASIC,
  },
  activatedUserCount: 5,
  inactiveUserCount: 1,
}

const mockPlanData = {
  isEnterprisePlan: false,
  baseUnitPrice: 10,
  benefits: [],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  value: Plans.USERS_BASIC,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

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

const wrapper =
  (initialEntries = ['/members/gh/critical-role']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/members/:provider/:owner">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('Activation', () => {
  function setup(
    accountDetails = mockedAccountDetails,
    trialStatus = TrialStatuses.NOT_STARTED,
    planValue = mockedAccountDetails.plan.value
  ) {
    server.use(
      http.get('/internal/:provider/:owner/account-details/', () => {
        return HttpResponse.json(accountDetails)
      }),
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: true,
              plan: {
                ...mockPlanData,
                trialStatus,
                value: planValue,
              },
            },
          },
        })
      })
    )
  }

  describe('rendering component', () => {
    it('displays title', async () => {
      setup()

      render(<Activation />, { wrapper: wrapper() })

      const title = await screen.findByRole('heading', {
        name: /Member activation/,
      })
      expect(title).toBeInTheDocument()
    })

    it('displays number of activated users', async () => {
      setup()

      render(<Activation />, { wrapper: wrapper() })

      const activatedMembers = await screen.findByText(/activated members of/)
      expect(activatedMembers).toBeInTheDocument()

      const memberCount = await screen.findByText('5')
      expect(memberCount).toBeInTheDocument()
    })

    it('displays number of plan quantity', async () => {
      setup()

      render(<Activation />, { wrapper: wrapper() })

      const planQuantity = await screen.findByText('9')
      expect(planQuantity).toBeInTheDocument()

      const availableSeats = await screen.findByText(/available seats/)
      expect(availableSeats).toBeInTheDocument()
    })

    it('displays change plan link', async () => {
      setup()

      render(<Activation />, { wrapper: wrapper() })

      const changePlanLink = await screen.findByText(/ChangePlanLink/)
      expect(changePlanLink).toBeInTheDocument()
    })

    describe('user is currently on a trial', () => {
      it('displays title', async () => {
        setup(mockedAccountDetails, TrialStatuses.ONGOING, 'users-trial')

        render(<Activation />, { wrapper: wrapper() })

        const title = await screen.findByRole('heading', {
          name: /Member activation/,
        })
        expect(title).toBeInTheDocument()
      })

      it('displays number of activated users', async () => {
        setup(mockedAccountDetails, TrialStatuses.ONGOING, 'users-trial')

        render(<Activation />, { wrapper: wrapper() })

        const activatedMembers = await screen.findByText(/activated members/)
        expect(activatedMembers).toBeInTheDocument()

        const memberCount = await screen.findByText('5')
        expect(memberCount).toBeInTheDocument()
      })

      it('displays on trial notice', async () => {
        setup(mockedAccountDetails, TrialStatuses.ONGOING, 'users-trial')

        render(<Activation />, { wrapper: wrapper() })

        const trialText = await screen.findByText(
          /Your org is on a free trial./
        )
        expect(trialText).toBeInTheDocument()
      })

      it('displays upgrade plan link', async () => {
        setup(mockedAccountDetails, TrialStatuses.ONGOING, 'users-trial')

        render(<Activation />, { wrapper: wrapper() })

        const upgradeLink = await screen.findByRole('link', {
          name: /Upgrade to Pro today./,
        })
        expect(upgradeLink).toBeInTheDocument()
        expect(upgradeLink).toHaveAttribute(
          'href',
          '/plan/gh/critical-role/upgrade'
        )
      })
    })

    describe('user has an expired trial', () => {
      it('displays title', async () => {
        setup(mockedAccountDetails, TrialStatuses.EXPIRED, 'users-basic')

        render(<Activation />, { wrapper: wrapper() })

        const title = await screen.findByRole('heading', {
          name: /Member activation/,
        })
        expect(title).toBeInTheDocument()
      })

      it('displays number of activated users', async () => {
        setup(mockedAccountDetails, TrialStatuses.EXPIRED, 'users-basic')

        render(<Activation />, { wrapper: wrapper() })

        const activatedMembers = await screen.findByText(/activated members of/)
        expect(activatedMembers).toBeInTheDocument()

        const memberCount = await screen.findByText('5')
        expect(memberCount).toBeInTheDocument()
      })

      it('displays number of plan quantity', async () => {
        setup(mockedAccountDetails, TrialStatuses.EXPIRED, 'users-basic')

        render(<Activation />, { wrapper: wrapper() })

        const planQuantity = await screen.findByText('9')
        expect(planQuantity).toBeInTheDocument()

        const availableSeats = await screen.findByText(/available seats/)
        expect(availableSeats).toBeInTheDocument()
      })

      it('displays org trialed text', async () => {
        setup(mockedAccountDetails, TrialStatuses.EXPIRED, 'users-basic')

        render(<Activation />, { wrapper: wrapper() })

        const orgTrialedText = await screen.findByText(
          /Your org trialed Pro Team plan/
        )
        expect(orgTrialedText).toBeInTheDocument()
      })

      it('displays change plan link', async () => {
        setup(mockedAccountDetails, TrialStatuses.EXPIRED, 'users-basic')

        render(<Activation />, { wrapper: wrapper() })

        const upgradeLink = await screen.findByRole('link', {
          name: /upgrade/,
        })
        expect(upgradeLink).toBeInTheDocument()
      })
    })
  })
})
