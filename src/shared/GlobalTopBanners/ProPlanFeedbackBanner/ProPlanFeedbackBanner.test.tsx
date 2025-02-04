import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { BillingRate, Plans } from 'shared/utils/billing'

import ProPlanFeedbackBanner from './ProPlanFeedbackBanner'

const mockTrialData = {
  hasPrivateRepos: true,
  plan: {
    isEnterprisePlan: false,
    isFreePlan: false,
    isProPlan: true,
    isSentryPlan: false,
    isTeamPlan: false,
    isTrialPlan: false,
    baseUnitPrice: 10,
    benefits: [],
    billingRate: BillingRate.MONTHLY,
    marketingName: 'Users Developer',
    monthlyUploadLimit: 250,
    value: Plans.USERS_PR_INAPPM,
    trialStatus: TrialStatuses.EXPIRED,
    trialStartDate: '2023-01-01T08:55:25',
    trialEndDate: '2023-01-10T08:55:25',
    trialTotalDays: 0,
    pretrialUsersCount: 0,
    planUserCount: 1,
    hasSeatsLeft: true,
  },
  pretrialPlan: {
    baseUnitPrice: 10,
    benefits: [],
    billingRate: BillingRate.MONTHLY,
    marketingName: 'Users Developer',
    monthlyUploadLimit: 250,
    value: Plans.USERS_DEVELOPER,
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  vi.resetAllMocks()
})
afterAll(() => server.close())

const wrapper =
  (initialEntries = ''): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('ProPlanFeedbackBanner', () => {
  function setup() {
    const user = userEvent.setup()
    const mockSetItem = vi.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = vi.spyOn(window.localStorage.__proto__, 'getItem')

    server.use(
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({ data: { owner: { ...mockTrialData } } })
      })
    )

    return {
      user,
      mockSetItem,
      mockGetItem,
    }
  }

  describe('rendering banner', () => {
    it('renders left side text', async () => {
      setup()
      render(<ProPlanFeedbackBanner />, { wrapper: wrapper('/gh/codecov') })

      const leftText = await screen.findByText(
        /We'd love your thoughts and feedback in this/
      )
      expect(leftText).toBeInTheDocument()
    })

    it('renders the link to the survey', async () => {
      setup()
      render(<ProPlanFeedbackBanner />, { wrapper: wrapper('/gh/codecov') })

      const link = await screen.findByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://forms.gle/nf37sRAtyQeXVTdr8'
      )
    })
  })

  describe('user dismisses banner', () => {
    it('calls local storage', async () => {
      const { user, mockGetItem, mockSetItem } = setup()
      render(<ProPlanFeedbackBanner />, { wrapper: wrapper('/gh/codecov') })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = await screen.findByText(/Dismiss/)
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() =>
        expect(mockSetItem).toHaveBeenCalledWith(
          'dismissed-top-banners',
          JSON.stringify({ 'pro-feedback-banner': 'true' })
        )
      )
    })

    it('hides the banner', async () => {
      const { user, mockGetItem } = setup()
      const { container } = render(<ProPlanFeedbackBanner />, {
        wrapper: wrapper('/gh/codecov'),
      })

      mockGetItem.mockReturnValue(null)

      const dismissBtn = await screen.findByText(/Dismiss/)
      expect(dismissBtn).toBeInTheDocument()
      await user.click(dismissBtn)

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })

  describe('user is not on pro plan', () => {
    it('does not render banner', async () => {
      const { container } = render(<ProPlanFeedbackBanner />, {
        wrapper: wrapper('/gh/codecov'),
      })
      expect(container).toBeEmptyDOMElement()
    })
  })
})
