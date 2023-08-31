import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { Plans } from 'shared/utils/billing'

import MembersActivation from './MembersActivation'

jest.mock('./AutoActivate/AutoActivate', () => () => 'AutoActivate')
jest.mock('./Activation/Activation', () => () => 'Activation')

const mockedAccountDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 9,
    value: 'users-basic',
  },
  activatedUserCount: 5,
  inactiveUserCount: 1,
}

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  planName: 'users-basic',
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/members/gh/codecov']}>
      <Route path="/members/:provider/:owner">{children}</Route>
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

describe('Members Activation', () => {
  function setup(
    accountDetails = mockedAccountDetails,
    trialStatus = TrialStatuses.NOT_STARTED,
    planValue = mockedAccountDetails.plan.value
  ) {
    server.use(
      rest.get('/internal/gh/:owner/account-details/', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(accountDetails))
      ),
      graphql.query('GetPlanData', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              plan: {
                ...mockPlanData,
                trialStatus,
                planName: planValue,
              },
            },
          })
        )
      )
    )
  }

  describe('MemberActivation', () => {
    it('renders activation component', async () => {
      setup()

      render(<MembersActivation />, { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const activation = await screen.findByText('Activation')
      expect(activation).toBeInTheDocument()
    })

    describe('user is currently on a trial', () => {
      describe('plan auto activate is not undefined', () => {
        it('does not render auto activate component', async () => {
          setup(
            { ...mockedAccountDetails, planAutoActivate: true },
            TrialStatuses.ONGOING,
            Plans.USERS_TRIAL
          )

          render(<MembersActivation />, { wrapper })

          await waitFor(() => queryClient.isFetching)
          await waitFor(() => !queryClient.isFetching)

          const AutoActivate = screen.queryByText(/AutoActivate/)
          expect(AutoActivate).not.toBeInTheDocument()
        })
      })

      describe('plan auto activation is undefined', () => {
        it('does not render auto activate component', async () => {
          setup(
            { ...mockedAccountDetails, planAutoActivate: undefined },
            TrialStatuses.ONGOING,
            Plans.USERS_TRIAL
          )

          render(<MembersActivation />, { wrapper })

          await waitFor(() => queryClient.isFetching)
          await waitFor(() => !queryClient.isFetching)

          const AutoActivate = screen.queryByText(/AutoActivate/)
          expect(AutoActivate).not.toBeInTheDocument()
        })
      })
    })

    describe('user is not on a trial', () => {
      describe('plan auto activate is not undefined', () => {
        it('renders auto activate component', async () => {
          setup({ ...mockedAccountDetails, planAutoActivate: true })

          render(<MembersActivation />, { wrapper })

          await waitFor(() => queryClient.isFetching)
          await waitFor(() => !queryClient.isFetching)

          const AutoActivate = await screen.findByText(/AutoActivate/)
          expect(AutoActivate).toBeInTheDocument()
        })
      })

      describe('plan auto activation is undefined', () => {
        it('does not render auto activate component', async () => {
          setup({ ...mockedAccountDetails, planAutoActivate: undefined })

          render(<MembersActivation />, { wrapper })

          await waitFor(() => queryClient.isFetching)
          await waitFor(() => !queryClient.isFetching)

          const AutoActivate = screen.queryByText(/AutoActivate/)
          expect(AutoActivate).not.toBeInTheDocument()
        })
      })
    })
  })
})
