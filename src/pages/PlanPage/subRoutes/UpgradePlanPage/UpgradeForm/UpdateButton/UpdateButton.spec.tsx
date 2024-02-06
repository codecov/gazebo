import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import UpdateButton from './UpdateButton'

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
      rest.get(`/internal/gh/codecov/account-details/`, (req, res, ctx) => {
        if (planValue === Plans.USERS_BASIC) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsBasic))
        } else {
          return res(ctx.status(200), ctx.json(mockAccountDetailsProMonthly))
        }
      })
    )

    const mockSetFormValue = jest.fn()
    const user = userEvent.setup()

    return { user, mockSetFormValue }
  }

  describe('when rendered', () => {
    describe('when there is a valid basic plan', () => {
      it('renders a valid Proceed to Checkout button', async () => {
        setup({ planValue: Plans.USERS_BASIC })

        const props = {
          isValid: true,
          newPlan: Plans.USERS_PR_INAPPY,
          seats: 3,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Proceed to Checkout')
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
  })
})
