import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import UpdateButton from './UpdateButton'

const mocks = vi.hoisted(() => ({
  increment: vi.fn(),
  gauge: vi.fn(),
}))

vi.mock('@sentry/react', async () => {
  const originalModule = await vi.importActual('@sentry/react')
  return {
    ...originalModule,
    metrics: {
      ...originalModule.metrics!,
      increment: mocks.increment,
      gauge: mocks.gauge,
    },
  }
})

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/upgrade']}>
      <Route path="/:provider/:owner/upgrade">
        <Suspense fallback={null}>{children}</Suspense>
      </Route>
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

const mockAccountDetailsBasic = {
  plan: {
    value: Plans.USERS_BASIC,
    quantity: 1,
  },
}

const mockAccountDetailsProMonthly = {
  plan: {
    value: Plans.USERS_PR_INAPPM,
    quantity: 4,
  },
}

const mockAccountDetailsTeamMonthly = {
  plan: {
    value: Plans.USERS_TEAMM,
    quantity: 3,
  },
}

interface SetupArgs {
  planValue: string
}

describe('UpdateButton', () => {
  function setup(
    { planValue = Plans.USERS_BASIC }: SetupArgs = {
      planValue: Plans.USERS_BASIC,
    }
  ) {
    server.use(
      http.get(`/internal/gh/codecov/account-details/`, (info) => {
        if (planValue === Plans.USERS_BASIC) {
          return HttpResponse.json(mockAccountDetailsBasic)
        } else if (planValue === Plans.USERS_TEAMM) {
          return HttpResponse.json(mockAccountDetailsTeamMonthly)
        } else {
          return HttpResponse.json(mockAccountDetailsProMonthly)
        }
      })
    )

    const mockSetFormValue = vi.fn()
    const user = userEvent.setup()

    return { user, mockSetFormValue }
  }

  describe('when rendered', () => {
    describe('when there is a valid basic plan', () => {
      it('renders a valid Proceed to checkout button', async () => {
        setup({ planValue: Plans.USERS_BASIC })

        const props = {
          isValid: true,
          newPlan: Plans.USERS_PR_INAPPY,
          seats: 3,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Proceed to checkout')
        expect(button).toBeInTheDocument()
        expect(button).not.toBeDisabled()
      })
    })

    describe('when there is a valid pro plan', () => {
      it('renders a valid Update button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })

        const props = {
          isValid: true,
          newPlan: Plans.USERS_PR_INAPPY,
          seats: 27,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Update')
        expect(button).toBeInTheDocument()
        expect(button).not.toBeDisabled()
      })
    })

    describe('when the button is invalid', () => {
      it('renders a disabled valid Update button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })

        const props = {
          isValid: false,
          newPlan: Plans.USERS_PR_INAPPY,
          seats: 6,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Update')
        expect(button).toBeInTheDocument()
        expect(button).toBeDisabled()
      })
    })

    describe('when there are no changes in plan or seats', () => {
      it('renders a disabled valid Update button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })

        const props = {
          isValid: true,
          newPlan: Plans.USERS_PR_INAPPM,
          seats: 4,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Update')
        expect(button).toBeInTheDocument()
        expect(button).toBeDisabled()
      })
    })

    describe('sends metrics to sentry', () => {
      it('updates counter on load and checkout', async () => {
        const { user } = setup({ planValue: Plans.USERS_TEAMM })

        const props = {
          isValid: true,
          newPlan: Plans.USERS_PR_INAPPM,
          seats: 4,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Update')
        expect(button).toBeInTheDocument()

        expect(mocks.increment).toHaveBeenCalledWith(
          'bundles_tab.bundle_details.visited_page',
          undefined,
          undefined
        )
        await user.click(button)
        expect(mocks.increment).toHaveBeenCalledWith(
          'billing_change.user.checkout_from_page',
          undefined,
          undefined
        )
      })

      it('updates gauge on team to pro', async () => {
        const { user } = setup({ planValue: Plans.USERS_TEAMM })

        const props = {
          isValid: true,
          newPlan: Plans.USERS_PR_INAPPM,
          seats: 4,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Update')
        expect(button).toBeInTheDocument()
        await user.click(button)
        expect(mocks.gauge).toHaveBeenCalledWith(
          'billing_change.user.seats_change',
          -3,
          {
            tags: { plan: 'team' },
          }
        )
        expect(mocks.gauge).toHaveBeenCalledWith(
          'billing_change.user.seats_change',
          4,
          {
            tags: { plan: 'pro' },
          }
        )
      })

      it('updates gauge on pro to team', async () => {
        const { user } = setup({ planValue: Plans.USERS_PR_INAPPM })

        const props = {
          isValid: true,
          newPlan: Plans.USERS_TEAMM,
          seats: 2,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Update')
        expect(button).toBeInTheDocument()
        await user.click(button)
        expect(mocks.gauge).toHaveBeenCalledWith(
          'billing_change.user.seats_change',
          2,
          {
            tags: { plan: 'team' },
          }
        )
        expect(mocks.gauge).toHaveBeenCalledWith(
          'billing_change.user.seats_change',
          -4,
          {
            tags: { plan: 'pro' },
          }
        )
      })

      it('updates seat count on a team plan change', async () => {
        const { user } = setup({ planValue: Plans.USERS_TEAMM })

        const props = {
          isValid: true,
          newPlan: Plans.USERS_TEAMM,
          seats: 5,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Update')
        expect(button).toBeInTheDocument()
        await user.click(button)
        expect(mocks.gauge).toHaveBeenCalledWith(
          'billing_change.user.seats_change',
          2,
          {
            tags: { plan: 'team' },
          }
        )
      })

      it('updates seat count on a pro plan change', async () => {
        const { user } = setup({ planValue: Plans.USERS_PR_INAPPM })

        const props = {
          isValid: true,
          newPlan: Plans.USERS_PR_INAPPM,
          seats: 1,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Update')
        expect(button).toBeInTheDocument()
        await user.click(button)
        expect(mocks.gauge).toHaveBeenCalledWith(
          'billing_change.user.seats_change',
          -3,
          {
            tags: { plan: 'pro' },
          }
        )
      })
    })
  })
})
