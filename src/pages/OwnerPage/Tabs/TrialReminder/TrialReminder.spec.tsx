import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/trial'
import { useFlags } from 'shared/featureFlags'
import { Plans } from 'shared/utils/billing'

import TrialReminder from './TrialReminder'

jest.mock('shared/featureFlags')

const mockedUseFlags = useFlags as jest.Mock<{ codecovTrialMvp: boolean }>

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">
          <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

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

interface SetupArgs {
  flagValue?: boolean
  planValue?: string
  trialStatus?: string
  trialStartDate?: string
  trialEndDate?: string
}

describe('TrialReminder', () => {
  function setup({
    flagValue = true,
    planValue = Plans.USERS_BASIC,
    trialStatus = TrialStatuses.NOT_STARTED,
    trialStartDate = '2023-01-01T08:55:25',
    trialEndDate = '2023-01-01T08:55:25',
  }: SetupArgs) {
    mockedUseFlags.mockReturnValue({
      codecovTrialMvp: flagValue,
    })

    server.use(
      graphql.query('GetTrialData', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: { plan: { trialStatus, trialStartDate, trialEndDate } },
          })
        )
      }),
      rest.get('/internal/gh/codecov/account-details/', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            plan: {
              value: planValue,
            },
          })
        )
      })
    )
  }

  describe('flag is enabled', () => {
    describe('user has not started a trial', () => {
      describe('user is on a free plan', () => {
        it('displays trial upgrade link', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.NOT_STARTED,
            trialStartDate: undefined,
            trialEndDate: undefined,
          })

          render(<TrialReminder />, { wrapper })

          const link = await screen.findByRole('link', {
            name: /Trial Pro Team/,
          })

          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/plan/gh/codecov')
        })
      })

      describe('user is not on a free plan', () => {
        it('does not display trial upgrade link', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            trialStatus: TrialStatuses.NOT_STARTED,
            trialStartDate: undefined,
            trialEndDate: undefined,
          })

          const { container } = render(<TrialReminder />, { wrapper })

          await waitFor(() =>
            expect(queryClient.isFetching()).toBeGreaterThan(0)
          )
          await waitFor(() => expect(queryClient.isFetching()).toBe(0))

          expect(container).toBeEmptyDOMElement()
        })
      })
    })

    describe('user is currently on a trial', () => {
      describe('it is within 4 days remaining on the trial', () => {
        it('displays trial upgrade link', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-10T08:55:25',
          })

          render(<TrialReminder />, { wrapper })

          const text = await screen.findByText(/Trial is active/)
          expect(text).toBeInTheDocument()
        })
      })

      describe('it is within 3 days remaining on the trial', () => {
        it('does not display the trial upgrade link', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { container } = render(<TrialReminder />, { wrapper })

          await waitFor(() =>
            expect(queryClient.isFetching()).toBeGreaterThan(0)
          )
          await waitFor(() => expect(queryClient.isFetching()).toBe(0))

          expect(container).toBeEmptyDOMElement()
        })
      })
    })

    describe('user has finished the trial', () => {
      describe('the user is on a free plan', () => {
        it('displays the upgrade link', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.EXPIRED,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          render(<TrialReminder />, { wrapper })

          const link = await screen.findByRole('link', { name: /Upgrade plan/ })
          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/plan/gh/codecov')
        })
      })

      describe('the user is not on a free plan', () => {
        it('does not display upgrade link', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            trialStatus: TrialStatuses.EXPIRED,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
          })

          const { container } = render(<TrialReminder />, { wrapper })

          await waitFor(() =>
            expect(queryClient.isFetching()).toBeGreaterThan(0)
          )
          await waitFor(() => expect(queryClient.isFetching()).toBe(0))

          expect(container).toBeEmptyDOMElement()
        })
      })
    })
  })

  describe('flag is disabled', () => {
    it('displays nothing', async () => {
      setup({ flagValue: false })

      const { container } = render(<TrialReminder />, { wrapper })

      expect(container).toBeEmptyDOMElement()
    })
  })
})
