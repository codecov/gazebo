import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { Plans } from 'shared/utils/billing'

import ReachingUploadLimitAlert from './ReachingUploadLimitAlert'

const server = setupServer()

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const mockPlanDataResponse = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Pro Team',
  monthlyUploadLimit: 341,
  value: Plans.USERS_PR_INAPPM,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
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

describe('ReachingUploadLimitAlert', () => {
  function setup() {
    server.use(
      graphql.query('GetPlanData', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: true,
              plan: { ...mockPlanDataResponse },
            },
          },
        })
      })
    )
  }

  describe('rendering banner', () => {
    beforeEach(() => {
      setup()
    })

    it('has header content', () => {
      render(<ReachingUploadLimitAlert />, { wrapper })

      const heading = screen.getByText('Upload limit almost reached')
      expect(heading).toBeInTheDocument()
    })

    it('has body content', () => {
      render(<ReachingUploadLimitAlert />, { wrapper })

      const body = screen.getByText(/This org is currently/)
      expect(body).toBeInTheDocument()
    })

    it('has the correct plan name', async () => {
      render(<ReachingUploadLimitAlert />, { wrapper })

      const body = await screen.findByText(/Pro Team/)
      expect(body).toBeInTheDocument()
    })

    it('has the correct upload limit', async () => {
      render(<ReachingUploadLimitAlert />, { wrapper })
      const body = await screen.findByText(/includes 341 free uploads/)
      expect(body).toBeInTheDocument()
    })

    it('has links to upgrade org plan', () => {
      render(<ReachingUploadLimitAlert />, { wrapper })

      const links = screen.getAllByRole('link', { name: /upgrade plan/i })
      expect(links.length).toBe(2)
      expect(links[0]).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
    })

    it('has link to email sales team', () => {
      render(<ReachingUploadLimitAlert />, { wrapper })

      const link = screen.getByRole('link', { name: /sales@codecov.io/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://about.codecov.io/sales')
    })
  })
})
