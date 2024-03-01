import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAccountDetails } from './useAccountDetails'

jest.mock('js-cookie')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/gh') =>
  ({ children }: { children: React.ReactNode }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

const provider = 'gh'
const owner = 'codecov'

const accountDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 5,
    value: 'users-inappm',
  },
  activatedUserCount: 2,
  inactiveUserCount: 1,
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useAccountDetails', () => {
  function setup() {
    server.use(
      rest.get(
        `/internal/${provider}/${owner}/account-details/`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(accountDetails))
        }
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns the data', async () => {
      const { result } = renderHook(
        () => useAccountDetails({ provider, owner }),
        {
          wrapper: wrapper(),
        }
      )

      await waitFor(() => expect(result.current).toEqual(accountDetails))
    })
  })
})
