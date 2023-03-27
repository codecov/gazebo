import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import { useCancelPlan } from './useCancelPlan'

const queryClient = new QueryClient()
const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) =>
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

describe('useCancelPlan', () => {
  const mockBody = jest.fn()

  function setup() {
    server.use(
      rest.patch(
        `/internal/${provider}/${owner}/account-details/`,
        async (req, res, ctx) => {
          const body = await req.json()
          mockBody(body)

          return res(ctx.status(200), ctx.json(accountDetails))
        }
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('calls with the correct body', async () => {
      const { result, waitFor } = renderHook(
        () => useCancelPlan({ provider, owner }),
        {
          wrapper: wrapper(),
        }
      )

      result.current.mutate()

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(mockBody).toBeCalled()
      expect(mockBody).toHaveBeenCalledWith({
        plan: {
          value: Plans.USERS_BASIC,
        },
      })
    })
  })
})
