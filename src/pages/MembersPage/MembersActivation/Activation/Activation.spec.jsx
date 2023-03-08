import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Activation from './Activation'

jest.mock('config')
jest.mock('./ChangePlanLink', () => () => 'ChangePlanLink')

const queryClient = new QueryClient()

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

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

const wrapper =
  (initialEntries = ['/members/gh/critical-role']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

describe('Members Activation', () => {
  function setup(accountDetails = mockedAccountDetails) {
    server.use(
      rest.get('/internal/members/gh/account-details/', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(accountDetails))
      )
    )
  }

  describe('Renders Component', () => {
    beforeEach(() => setup())

    if (
      ('Displays title',
      async () => {
        render(<Activation />, { wrapper: wrapper() })

        expect(await screen.findByText(/Member activation/)).toBeInTheDocument()
      })
    )
      it('Displays number of activated users', async () => {
        render(<Activation />, { wrapper: wrapper() })

        expect(await screen.findByText(/active members of/)).toBeInTheDocument()
        expect(await screen.findByText('5')).toBeInTheDocument()
      })

    it('Displays number of plan quantity', async () => {
      render(<Activation />, { wrapper: wrapper() })

      expect(await screen.findByText('9')).toBeInTheDocument()
      expect(await screen.findByText(/available seats/)).toBeInTheDocument()
    })

    it('Renders change plan link', async () => {
      render(<Activation />, { wrapper: wrapper() })

      const changePlanLink = await screen.findByText(/ChangePlanLink/)
      expect(changePlanLink).toBeInTheDocument()
    })
  })
})
