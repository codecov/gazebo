import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useFlags } from 'shared/featureFlags'

import PlanPage from './PlanPage'

jest.mock('config')

jest.mock('./Header', () => () => 'Header')
jest.mock('./Tabs', () => () => 'Tabs')
jest.mock('./subRoutes/CancelPlanPage', () => () => 'CancelPlanPage')
jest.mock('./subRoutes/CurrentOrgPlan', () => () => 'CurrentOrgPlan')
jest.mock('./subRoutes/InvoicesPage', () => () => 'InvoicesPage')
jest.mock('./subRoutes/InvoiceDetailsPage', () => () => 'InvoiceDetailsPage')
jest.mock('./subRoutes/UpgradePlanPage', () => () => 'UpgradePlanPage')

// temp, for new header work
jest.mock('shared/featureFlags')

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: true,
    },
  },
})

let testLocation
const wrapper =
  (initialEntries = '') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/plan/:provider/:owner">
            <Suspense fallback={null}>{children}</Suspense>
          </Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  jest.resetAllMocks()
})
afterAll(() => {
  server.close()
})

describe('PlanPage', () => {
  function setup(
    { owner, isSelfHosted = false } = {
      owner: {
        username: 'codecov',
        isCurrentUserPartOfOrg: true,
        numberOfUploads: 10,
      },
    }
  ) {
    config.IS_SELF_HOSTED = isSelfHosted

    server.use(
      graphql.query('PlanPageData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner }))
      )
    )
    useFlags.mockReturnValue({
      newHeader: false,
    })
  }

  describe('when user is not part of the org', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: false,
          numberOfUploads: null,
        },
      })
    })

    it('redirects the user to the org page', async () => {
      render(<PlanPage />, { wrapper: wrapper('/plan/gh/codecov') })

      await waitFor(() => expect(testLocation.pathname).toBe('/gh/codecov'))
    })
  })

  describe('when the environment is self-hosted', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: false,
          numberOfUploads: null,
        },
      })
    })

    it('redirects the user to the org page', async () => {
      render(<PlanPage />, { wrapper: wrapper('/plan/gh/codecov') })

      await waitFor(() => expect(testLocation.pathname).toBe('/gh/codecov'))
    })
  })

  describe('when the owner is part of org', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
          numberOfUploads: 30,
        },
      })
    })

    it('renders header component', async () => {
      render(<PlanPage />, { wrapper: wrapper('/plan/gh/codecov') })

      const header = await screen.findByText(/Header/)
      expect(header).toBeInTheDocument()
    })

    it('renders tabs component', async () => {
      render(<PlanPage />, { wrapper: wrapper('/plan/gh/codecov') })

      const tabs = await screen.findByText(/Tabs/)
      expect(tabs).toBeInTheDocument()
    })
  })

  describe('testing routes', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
          numberOfUploads: 30,
        },
      })
    })

    describe('on root route', () => {
      it('renders current org plan page', async () => {
        render(<PlanPage />, { wrapper: wrapper('/plan/gh/codecov') })

        const currentPlanPage = await screen.findByText(/CurrentOrgPlan/)
        expect(currentPlanPage).toBeInTheDocument()
      })
    })

    describe('on upgrade path', () => {
      it('renders upgrade plan page', async () => {
        render(<PlanPage />, { wrapper: wrapper('/plan/gh/codecov/upgrade') })

        const upgradePlanPage = await screen.findByText(/UpgradePlanPage/)
        expect(upgradePlanPage).toBeInTheDocument()
      })
    })

    describe('on invoices path', () => {
      it('renders invoices page', async () => {
        render(<PlanPage />, { wrapper: wrapper('/plan/gh/codecov/invoices') })

        const invoicesPage = await screen.findByText(/InvoicesPage/)
        expect(invoicesPage).toBeInTheDocument()
      })
    })

    describe('on invoices id path', () => {
      it('renders invoices details page', async () => {
        render(<PlanPage />, {
          wrapper: wrapper('/plan/gh/codecov/invoices/1'),
        })

        const invoicesDetailsPage = await screen.findByText(
          /InvoiceDetailsPage/
        )
        expect(invoicesDetailsPage).toBeInTheDocument()
      })
    })

    describe('on cancel path', () => {
      it('renders cancel plan page', async () => {
        render(<PlanPage />, { wrapper: wrapper('/plan/gh/codecov/cancel') })

        const cancelPlanPage = await screen.findByText(/CancelPlanPage/)
        expect(cancelPlanPage).toBeInTheDocument()
      })
    })

    describe('on random path', () => {
      it('redirects the user to the current plan page', async () => {
        render(<PlanPage />, { wrapper: wrapper('/plan/gh/codecov/blah') })

        await waitFor(() =>
          expect(testLocation.pathname).toBe('/plan/gh/codecov')
        )
      })
    })
  })

  describe('header feature flagging', () => {
    it('renders header when flag is false', async () => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
          numberOfUploads: 30,
        },
      })
      render(<PlanPage />, { wrapper: wrapper('/plan/gh/codecov') })

      const header = await screen.findByText(/Header/)
      expect(header).toBeInTheDocument()
    })

    it('does not render header when flag is true', async () => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
          numberOfUploads: 30,
        },
      })

      render(<PlanPage />, { wrapper: wrapper('/plan/gh/codecov') })
      useFlags.mockReturnValue({
        newHeader: true,
      })

      const header = screen.queryByText(/Header/)
      expect(header).not.toBeInTheDocument()
    })
  })
})
