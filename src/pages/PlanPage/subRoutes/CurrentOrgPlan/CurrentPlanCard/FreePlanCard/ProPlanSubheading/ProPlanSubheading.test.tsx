import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account/usePlanData'
import { BillingRate, Plans } from 'shared/utils/billing'

import ProPlanSubheading from './ProPlanSubheading'

const mockResponse = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Developer',
  monthlyUploadLimit: 250,
  value: Plans.USERS_DEVELOPER,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  freeSeatCount: 0,
  hasSeatsLeft: true,
  isEnterprisePlan: false,
  isFreePlan: true,
  isProPlan: false,
  isSentryPlan: false,
  isTeamPlan: false,
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/gh/codecov']}>
      <Route path="/plan/:provider/:owner">{children}</Route>
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

interface SetupArgs {
  trialStatus?: string | null
  planValue?: string
  hasPrivateRepos?: boolean
}

describe('ProPlanSubheading', () => {
  function setup({
    trialStatus = TrialStatuses.NOT_STARTED,
    planValue = Plans.USERS_DEVELOPER,
    hasPrivateRepos = true,
  }: SetupArgs) {
    server.use(
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos,
              plan: {
                ...mockResponse,
                isTrialPlan: planValue === Plans.USERS_TRIAL,
                trialStatus,
                value: planValue,
              },
            },
          },
        })
      })
    )
  }

  describe('user is not eligible for a trial', () => {
    it('renders nothing', async () => {
      setup({ trialStatus: TrialStatuses.CANNOT_TRIAL })

      const { container } = render(<ProPlanSubheading />, { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('user is on a free plan', () => {
    describe('user has private repos', () => {
      it('renders correct text', async () => {
        setup({ trialStatus: TrialStatuses.NOT_STARTED, hasPrivateRepos: true })

        render(<ProPlanSubheading />, { wrapper })

        const text = await screen.findByText(/Includes 14-day free trial/)
        expect(text).toBeInTheDocument()
      })

      it('renders faq link', async () => {
        setup({ trialStatus: TrialStatuses.NOT_STARTED })

        render(<ProPlanSubheading />, { wrapper })

        const faqLink = await screen.findByRole('link', { name: /FAQ/ })
        expect(faqLink).toBeInTheDocument()
        expect(faqLink).toHaveAttribute(
          'href',
          'https://docs.codecov.com/docs/free-trial-faqs'
        )
      })
    })

    describe('user does not have private repos', () => {
      it('renders correct text', async () => {
        setup({ trialStatus: TrialStatuses.NOT_STARTED, hasPrivateRepos: true })

        render(<ProPlanSubheading />, { wrapper })

        const text = screen.queryByText(/Includes 14-day free trial/)
        expect(text).not.toBeInTheDocument()
      })

      it('renders faq link', async () => {
        setup({ trialStatus: TrialStatuses.NOT_STARTED })

        render(<ProPlanSubheading />, { wrapper })

        const faqLink = screen.queryByRole('link', { name: /FAQ/ })
        expect(faqLink).not.toBeInTheDocument()
      })
    })
  })

  describe('user is currently on a trial', () => {
    it('renders correct text', async () => {
      setup({
        trialStatus: TrialStatuses.ONGOING,
        planValue: Plans.USERS_TRIAL,
      })

      render(<ProPlanSubheading />, { wrapper })

      const text = await screen.findByText(/Current trial/)
      expect(text).toBeInTheDocument()
    })

    it('renders link to faqs', async () => {
      setup({
        trialStatus: TrialStatuses.ONGOING,
        planValue: Plans.USERS_TRIAL,
      })

      render(<ProPlanSubheading />, { wrapper })

      const faqLink = await screen.findByRole('link', { name: /FAQ/ })
      expect(faqLink).toBeInTheDocument()
      expect(faqLink).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/free-trial-faqs'
      )
    })
  })

  describe('users trial has expired', () => {
    it('renders correct text', async () => {
      setup({
        trialStatus: TrialStatuses.EXPIRED,
      })

      render(<ProPlanSubheading />, { wrapper })

      const text = await screen.findByText(/Your org trialed this plan/)
      expect(text).toBeInTheDocument()
    })
  })
})
