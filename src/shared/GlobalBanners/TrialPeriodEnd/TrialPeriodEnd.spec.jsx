import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import TrialPeriodEnd from './TrialPeriodEnd'

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
  function setup(accountData, ownerData) {
    server.use(
      rest.all('/internal/gh/test-org/account-details', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(accountData))
      ),
      graphql.query('DetailOwner', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(ownerData))
      )
    )
  }

  describe('when there arent account details', () => {
    beforeEach(() => {
      const mockDetailsNull = {
        subscriptionDetail: null,
      }
      const mockOwnerData = { owner: null }
      setup(mockDetailsNull, mockOwnerData)
    })

    it('should not render trial period end banner', async () => {
      render(<TrialPeriodEnd />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const bannerTitle = screen.queryByText(/Trial expiring soon/)
      expect(bannerTitle).not.toBeInTheDocument()
    })
  })

  describe('when the users current org is undefined', () => {
    beforeEach(() => {
      const mockDetailsNull = {
        subscriptionDetail: null,
      }
      const mockOwnerData = { owner: { isCurrentUserPartOfOrg: undefined } }
      setup(mockDetailsNull, mockOwnerData)
    })

    it('should not render trial period end banner', async () => {
      render(<TrialPeriodEnd />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const bannerTitle = screen.queryByText(/Trial expiring soon/)
      expect(bannerTitle).not.toBeInTheDocument()
    })
  })

  describe('when the user is not part of the current org', () => {
    beforeEach(() => {
      const mockDetailsNull = {
        subscriptionDetail: null,
      }
      const mockOwnerData = { owner: { isCurrentUserPartOfOrg: false } }
      setup(mockDetailsNull, mockOwnerData)
    })

    it('should not render trial period end banner', async () => {
      render(<TrialPeriodEnd />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const bannerTitle = screen.queryByText(/Trial expiring soon/)
      expect(bannerTitle).not.toBeInTheDocument()
    })
  })

  describe('when modal should show', () => {
    beforeEach(() => {
      // Today plus 4 days
      const trialEnd = Math.floor(Date.now() / 1000) + 86401 * 4

      const mockDetails = {
        subscriptionDetail: {
          trialEnd,
          defaultPaymentMethod: null,
        },
      }
      const mockOwnerData = { owner: { isCurrentUserPartOfOrg: true } }
      setup(mockDetails, mockOwnerData)
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

// {
//   owner: {
//     orgUploadToken: 'token',
//     ownerid: 123,
//     username: 'cool-user',
//     avatarUrl: 'url',
//     isCurrentUserPartOfOrg: true,
//     isAdmin: true,
//   },
// }
