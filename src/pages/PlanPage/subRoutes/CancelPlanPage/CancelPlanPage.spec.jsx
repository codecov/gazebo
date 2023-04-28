import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import CancelPlanPage from './CancelPlanPage'

jest.mock('./subRoutes/SpecialOffer', () => () => 'SpecialOffer')
jest.mock('./subRoutes/DowngradePlan', () => () => 'DowngradePlan')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

let testLocation
const wrapper =
  (initialEntries = '') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>
          <MemoryRouter initialEntries={[initialEntries]}>
            <Route path="/plan/:provider/:owner">{children}</Route>
            <Route
              path="*"
              render={({ location }) => {
                testLocation = location
                return null
              }}
            />
          </MemoryRouter>
        </Suspense>
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

describe('CancelPlanPage', () => {
  function setup(
    { hasDiscount = false, planValue = Plans.USERS_PR_INAPPM } = {
      hasDiscount: false,
      planValue: Plans.USERS_PR_INAPPM,
    }
  ) {
    server.use(
      rest.get('internal/gh/codecov/account-details/', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json({
            plan: {
              value: planValue,
            },
            subscriptionDetail: {
              customer: {
                discount: hasDiscount,
              },
            },
          })
        )
      )
    )
  }

  describe('user has not applied discount', () => {
    beforeEach(() => setup())

    describe('testing routes', () => {
      describe('on root cancel path', () => {
        it('renders cancel plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel'),
          })

          const specialOffer = await screen.findByText('SpecialOffer')
          expect(specialOffer).toBeInTheDocument()
        })
      })

      describe('on downgrade path', () => {
        it('renders downgrade plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel/downgrade'),
          })

          const downgrade = await screen.findByText('DowngradePlan')
          expect(downgrade).toBeInTheDocument()
        })
      })

      describe('on random path', () => {
        it('redirects to root cancel plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel/blah'),
          })

          await waitFor(() =>
            expect(testLocation.pathname).toBe('/plan/gh/codecov/cancel')
          )

          const specialOffer = await screen.findByText('SpecialOffer')
          expect(specialOffer).toBeInTheDocument()
        })
      })
    })
  })

  describe('user has discount applied', () => {
    beforeEach(() => setup({ hasDiscount: true }))

    describe('testing routes', () => {
      describe('on root cancel path', () => {
        it('redirects to downgrade plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel'),
          })

          await waitFor(() =>
            expect(testLocation.pathname).toBe(
              '/plan/gh/codecov/cancel/downgrade'
            )
          )

          const downgrade = await screen.findByText('DowngradePlan')
          expect(downgrade).toBeInTheDocument()
        })
      })

      describe('on downgrade path', () => {
        it('renders downgrade plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel/downgrade'),
          })

          const downgrade = await screen.findByText('DowngradePlan')
          expect(downgrade).toBeInTheDocument()
        })
      })

      describe('on random cancel path', () => {
        it('redirects to root downgrade plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel/blah'),
          })

          await waitFor(() =>
            expect(testLocation.pathname).toBe(
              '/plan/gh/codecov/cancel/downgrade'
            )
          )

          const downgrade = await screen.findByText('DowngradePlan')
          expect(downgrade).toBeInTheDocument()
        })
      })

      describe('on random downgrade path', () => {
        it('redirects to root downgrade plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel/downgrade/blah'),
          })

          await waitFor(() =>
            expect(testLocation.pathname).toBe(
              '/plan/gh/codecov/cancel/downgrade'
            )
          )

          const downgrade = await screen.findByText('DowngradePlan')
          expect(downgrade).toBeInTheDocument()
        })
      })
    })
  })

  describe('user is on a annual plan', () => {
    beforeEach(() => setup({ planValue: Plans.USERS_INAPPY }))

    it('directs them directly to downgrade page', async () => {
      render(<CancelPlanPage />, {
        wrapper: wrapper('/plan/gh/codecov/cancel'),
      })

      await waitFor(() =>
        expect(testLocation.pathname).toBe('/plan/gh/codecov/cancel/downgrade')
      )

      const downgrade = await screen.findByText('DowngradePlan')
      expect(downgrade).toBeInTheDocument()
    })
  })

  describe('user is on an enterprise plan', () => {
    beforeEach(() => setup({ planValue: Plans.USERS_ENTERPRISEM }))

    it('directs them directly to plan page', async () => {
      render(<CancelPlanPage />, {
        wrapper: wrapper('/plan/gh/codecov/cancel'),
      })

      await waitFor(() =>
        expect(testLocation.pathname).toBe('/plan/gh/codecov')
      )
    })
  })
})
