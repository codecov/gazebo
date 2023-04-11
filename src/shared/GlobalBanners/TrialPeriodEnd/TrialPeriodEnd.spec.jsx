import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import TrialPeriodEnd from './TrialPeriodEnd'

const queryClient = new QueryClient()

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
  (initialEntries = ['/gh/test-org']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

describe('TrialPeriodEnd', () => {
  function setup(data) {
    server.use(
      rest.all('/internal/gh/test-org/account-details', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(data))
      )
    )
  }

  describe('when modal should hide', () => {
    beforeEach(() => {
      const mockDetailsNull = {
        subscriptionDetail: null,
      }
      setup(mockDetailsNull)
    })

    it('does not render anything related to the trial period end', async () => {
      render(<TrialPeriodEnd />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const bannerTitle = screen.queryByText(/Trial expiring soon/)
      expect(bannerTitle).not.toBeInTheDocument()
    })
  })

  describe('when modal should show', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2023-04-11'))

      const mockDetails = {
        subscriptionDetail: {
          trialEnd: 1681551394,
          defaultPaymentMethod: null,
        },
      }
      setup(mockDetails)
    })

    it('renders banner', async () => {
      render(<TrialPeriodEnd />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const bannerTitle = await screen.findByText(/Trial expiring soon/)
      expect(bannerTitle).toBeInTheDocument()

      const dateDiff = await screen.findByText(/4/)
      expect(dateDiff).toBeInTheDocument()

      const bannerBody = await screen.findByText(
        /If you'd like to continue utilizing Codecov at a discounted rate, please input your payment info/
      )
      expect(bannerBody).toBeInTheDocument()

      const anchorLinks = await screen.findAllByRole('link', {
        name: /here/,
      })
      expect(anchorLinks).toHaveLength(2)
      expect(anchorLinks[0]).toHaveAttribute(
        'href',
        'https://billing.stripe.com/p/login/aEU00i9by3V4caQ6oo'
      )
      expect(anchorLinks[1]).toHaveAttribute(
        'href',
        'https://codecov.freshdesk.com/support/home'
      )
    })
  })
})
