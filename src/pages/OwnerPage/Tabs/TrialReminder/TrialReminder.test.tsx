import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { TrialStatuses } from 'services/account'
import { BillingRate, Plans } from 'shared/utils/billing'

import TrialReminder from './TrialReminder'

vi.mock('config')

const mockedConfig = config as { IS_SELF_HOSTED: boolean }

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const mockResponse = {
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
  isEnterprisePlan: false,
}

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
  trialStatus?: string | null
  trialStartDate?: string | null
  trialEndDate?: string | null
  userPartOfOrg?: boolean
  isSelfHosted?: boolean
  hasPrivateRepos?: boolean
}

describe('TrialReminder', () => {
  function setup({
    planValue = Plans.USERS_BASIC,
    trialStatus = TrialStatuses.CANNOT_TRIAL,
    trialStartDate = '2023-01-01T08:55:25',
    trialEndDate = '2023-01-01T08:55:25',
    userPartOfOrg = true,
    isSelfHosted = false,
    hasPrivateRepos = true,
  }: SetupArgs) {
    mockedConfig.IS_SELF_HOSTED = isSelfHosted

    server.use(
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos,
              plan: {
                ...mockResponse,
                trialStatus,
                trialStartDate,
                trialEndDate,
                value: planValue,
              },
            },
          },
        })
      }),
      graphql.query('DetailOwner', () => {
        return HttpResponse.json({
          data: { owner: { isCurrentUserPartOfOrg: userPartOfOrg } },
        })
      })
    )
  }

  describe('user has not started a trial', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2023-01-01'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    describe('user is on a free plan', () => {
      describe('user is part of org', () => {
        it('displays trial upgrade link', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.NOT_STARTED,
            trialStartDate: undefined,
            trialEndDate: undefined,
            userPartOfOrg: true,
          })

          render(<TrialReminder />, { wrapper })

          const link = await screen.findByRole('link', {
            name: /Try Codecov Pro/,
          })

          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/plan/gh/codecov')
        })
      })

      describe('user is not part of org', () => {
        it('does not display trial upgrade link', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.NOT_STARTED,
            trialStartDate: undefined,
            trialEndDate: undefined,
            userPartOfOrg: false,
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

    describe('user is not on a free plan', () => {
      it('does not display trial upgrade link', async () => {
        setup({
          planValue: Plans.USERS_PR_INAPPY,
          trialStatus: TrialStatuses.NOT_STARTED,
          trialStartDate: undefined,
          trialEndDate: undefined,
        })

        const { container } = render(<TrialReminder />, { wrapper })

        await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
        await waitFor(() => expect(queryClient.isFetching()).toBe(0))

        expect(container).toBeEmptyDOMElement()
      })
    })
  })

  describe('user is currently on a trial', () => {
    describe('it is within 4 days remaining on the trial', () => {
      beforeEach(() => {
        vi.useFakeTimers().setSystemTime(new Date('2023-01-01'))
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      describe('user is part of org', () => {
        it('displays trial upgrade link', async () => {
          setup({
            planValue: Plans.USERS_TRIAL,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-10T08:55:25',
          })

          render(<TrialReminder />, { wrapper })

          const link = await screen.findByRole('link', {
            name: /Upgrade now/,
          })
          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
        })
      })

      describe('user is not part of org', () => {
        it('does not display trial upgrade link', async () => {
          setup({
            planValue: Plans.USERS_TRIAL,
            trialStatus: TrialStatuses.ONGOING,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-10T08:55:25',
            userPartOfOrg: false,
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

    describe('it is within 3 days remaining on the trial', () => {
      beforeEach(() => {
        vi.useFakeTimers().setSystemTime(new Date('2023-01-02'))
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('does not display the trial upgrade link', async () => {
        setup({
          planValue: Plans.USERS_BASIC,
          trialStatus: TrialStatuses.ONGOING,
          trialStartDate: '2023-01-01T08:55:25',
          trialEndDate: '2023-01-02T08:55:25',
        })

        const { container } = render(<TrialReminder />, { wrapper })

        await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
        await waitFor(() => expect(queryClient.isFetching()).toBe(0))

        expect(container).toBeEmptyDOMElement()
      })
    })
  })

  describe('user has finished the trial', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2023-01-01'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    describe('the user is on a free plan', () => {
      describe('user is part of the org', () => {
        it('displays the upgrade link', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.EXPIRED,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
            userPartOfOrg: true,
          })

          render(<TrialReminder />, { wrapper })

          const link = await screen.findByRole('link', {
            name: /Upgrade plan/,
          })
          expect(link).toBeInTheDocument()
          expect(link).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
        })
      })

      describe('user is not part of org', () => {
        it('does not display trial upgrade link', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            trialStatus: TrialStatuses.EXPIRED,
            trialStartDate: '2023-01-01T08:55:25',
            trialEndDate: '2023-01-02T08:55:25',
            userPartOfOrg: false,
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

    describe('the user is not on a free plan', () => {
      it('does not display upgrade link', async () => {
        setup({
          planValue: Plans.USERS_PR_INAPPY,
          trialStatus: TrialStatuses.EXPIRED,
          trialStartDate: '2023-01-01T08:55:25',
          trialEndDate: '2023-01-02T08:55:25',
        })

        const { container } = render(<TrialReminder />, { wrapper })

        await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
        await waitFor(() => expect(queryClient.isFetching()).toBe(0))

        expect(container).toBeEmptyDOMElement()
      })
    })
  })

  describe('user cannot trial', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2023-01-01'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('does not display upgrade link', async () => {
      setup({
        planValue: Plans.USERS_PR_INAPPY,
        trialStatus: TrialStatuses.CANNOT_TRIAL,
        trialStartDate: '2023-01-01T08:55:25',
        trialEndDate: '2023-01-01T08:55:25',
      })

      const { container } = render(<TrialReminder />, { wrapper })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('user does not have private repos', () => {
    it('does not display upgrade link', async () => {
      setup({
        planValue: Plans.USERS_PR_INAPPY,
        trialStatus: TrialStatuses.NOT_STARTED,
        trialStartDate: null,
        trialEndDate: null,
        hasPrivateRepos: false,
      })

      const { container } = render(<TrialReminder />, { wrapper })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('API returns no information', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2023-01-01'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns nothing', async () => {
      setup({
        planValue: Plans.USERS_BASIC,
        trialStartDate: null,
        trialEndDate: null,
      })

      const { container } = render(<TrialReminder />, { wrapper })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('app is running in self hosted', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2023-01-01'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('renders nothing', async () => {
      setup({
        planValue: Plans.USERS_BASIC,
        trialStatus: TrialStatuses.NOT_STARTED,
        trialStartDate: undefined,
        trialEndDate: undefined,
        userPartOfOrg: true,
        isSelfHosted: true,
      })

      const { container } = render(<TrialReminder />, { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      expect(container).toBeEmptyDOMElement()
    })
  })
})
