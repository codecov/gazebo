import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'

import SentryUpgradeForm from './SentryUpgradeForm'

jest.mock('services/toastNotification')
jest.mock('@stripe/react-stripe-js')

const basicPlan = {
  marketingName: 'Basic',
  value: 'users-basic',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Up to 1 user',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
  quantity: 1,
}

const sentryPlanMonth = {
  marketingName: 'Sentry Pro Team',
  value: 'users-sentrym',
  billingRate: 'monthly',
  baseUnitPrice: 12,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  trialDays: 14,
  quantity: 10,
}

const sentryPlanYear = {
  marketingName: 'Sentry Pro Team',
  value: 'users-sentryy',
  billingRate: 'annually',
  baseUnitPrice: 10,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  trialDays: 14,
  quantity: 10,
}

const queryClient = new QueryClient({
  logger: {
    error: () => {},
  },
})
const server = setupServer()

let testLocation
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/gh/codecov/upgrade']}>
      <Route path="/plan/:provider/:owner/upgrade">{children}</Route>
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

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('SentryUpgradeForm', () => {
  function setup(successfulRequest = true, errorDetails = undefined) {
    const user = userEvent.setup()
    const addNotification = jest.fn()

    useAddNotification.mockReturnValue(addNotification)

    server.use(
      rest.patch('/internal/gh/codecov/account-details/', (req, res, ctx) => {
        if (!successfulRequest) {
          if (errorDetails) {
            return res(ctx.status(500), ctx.json({ detail: errorDetails }))
          }
          return res(ctx.status(500), ctx.json({ success: false }))
        }
        return res(ctx.status(200), ctx.json({ success: true }))
      })
    )

    return { user, addNotification }
  }

  describe('when the user does not have any plan', () => {
    beforeEach(() => {
      setup()
    })

    it('renders plan details section', async () => {
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: null,
            latestInvoice: null,
          }}
        />,
        { wrapper }
      )

      const header = await screen.findByRole('heading', {
        name: 'Plan Details',
      })
      expect(header).toBeInTheDocument()

      const duration = await screen.findByText(/14 day free trial/)
      expect(duration).toBeInTheDocument()

      const pricingInfo = await screen.findByText(
        /then \$29 monthly includes 5 seats./
      )
      expect(pricingInfo).toBeInTheDocument()
    })

    it('renders monthly radio button', async () => {
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: null,
            latestInvoice: null,
          }}
        />,
        { wrapper }
      )

      const radio = await screen.findByRole('radio', { name: /\$12/i })
      expect(radio).toBeInTheDocument()
      expect(radio).not.toBeDisabled()
    })

    it('renders annual radio button', async () => {
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: null,
            latestInvoice: null,
          }}
        />,
        { wrapper }
      )

      const radio = await screen.findByRole('radio', { name: /\$10/i })
      expect(radio).toBeInTheDocument()
      expect(radio).not.toBeDisabled()
    })

    it('renders the seat input with 5 seats', async () => {
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: null,
            latestInvoice: null,
          }}
        />,
        { wrapper }
      )

      const numberInput = await screen.findByRole('spinbutton')
      expect(numberInput).toBeInTheDocument()
      expect(numberInput).toHaveValue(5)
      expect(numberInput).not.toBeDisabled()
    })
  })

  describe('when the user have a free plan', () => {
    beforeEach(() => {
      setup()
    })

    it('renders annual', async () => {
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: basicPlan,
            latestInvoice: null,
          }}
        />,
        { wrapper }
      )

      const radio = await screen.findByRole('radio', { name: /\$10/ })
      expect(radio).toBeInTheDocument()
      expect(radio).toBeChecked()
    })

    it('renders the seat input with 5 seats', async () => {
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: basicPlan,
            latestInvoice: null,
          }}
        />,
        { wrapper }
      )

      const numberInput = await screen.findByRole('spinbutton')
      expect(numberInput).toHaveValue(5)
    })
  })

  describe('when the user have a sentry year plan', () => {
    beforeEach(() => {
      setup()
    })

    it('renders annual radio to be checked', async () => {
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: sentryPlanYear,
            latestInvoice: null,
          }}
        />,
        { wrapper }
      )

      const radio = await screen.findByRole('radio', { name: /10/i })
      expect(radio).toBeChecked()
    })

    it('renders the seat input with 10 seats (existing subscription)', async () => {
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: sentryPlanYear,
            latestInvoice: null,
          }}
        />,
        { wrapper }
      )

      const seatCount = await screen.findByRole('spinbutton')
      expect(seatCount).toHaveValue(10)
    })

    it('has the price for the year', async () => {
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: sentryPlanYear,
            latestInvoice: null,
          }}
        />,
        { wrapper }
      )

      const price = await screen.findByText(/\$79.00/)
      expect(price).toBeInTheDocument()

      const priceBreakdown = await screen.findByText(
        /\/per month billed annually at \$948.00/
      )
      expect(priceBreakdown).toBeInTheDocument()
    })

    it('has the update button disabled', async () => {
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: sentryPlanYear,
            latestInvoice: null,
          }}
        />,
        { wrapper }
      )

      const update = await screen.findByText(/Update/)
      expect(update).toBeDisabled()
    })

    describe('when updating to a month plan', () => {
      it('has the price for the month', async () => {
        const { user } = setup()
        render(
          <SentryUpgradeForm
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: sentryPlanYear,
              latestInvoice: null,
            }}
          />,
          { wrapper }
        )

        const monthRadio = await screen.findByRole('radio', { name: /12/i })
        await user.click(monthRadio)

        const price = screen.getByText(/\$89.00/)
        expect(price).toBeInTheDocument()
      })
    })
  })

  describe('when the user have a sentry monthly plan', () => {
    describe('user clicks select annual', () => {
      it('renders annual radio to be checked', async () => {
        const { user } = setup()
        render(
          <SentryUpgradeForm
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: sentryPlanMonth,
              latestInvoice: null,
            }}
          />,
          { wrapper }
        )

        const switchAnnual = await screen.findByText('switch to annual')
        await user.click(switchAnnual)

        const annualRadio = await screen.findByRole('radio', {
          name: /10/i,
        })
        expect(annualRadio).toBeChecked()
      })
    })
  })

  describe('display student info', () => {
    describe('when there are no students', () => {
      beforeEach(() => setup())

      it('renders text for 1 student not taking active seats', async () => {
        render(
          <SentryUpgradeForm
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: sentryPlanMonth,
              latestInvoice: null,
              activatedStudentCount: 0,
            }}
          />,
          { wrapper }
        )

        const singleStudentText = screen.queryByText(
          /\*You have 1 active student that does not count towards the number of active seats./
        )
        expect(singleStudentText).not.toBeInTheDocument()

        const multiStudentText = screen.queryByText(
          /\*You have 3 active students that do not count towards the number of active seats./
        )
        expect(multiStudentText).not.toBeInTheDocument()
      })
    })

    describe('when there is a single student', () => {
      beforeEach(() => setup())

      it('renders text for 1 student not taking active seats', async () => {
        render(
          <SentryUpgradeForm
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: sentryPlanMonth,
              latestInvoice: null,
              activatedStudentCount: 1,
            }}
          />,
          { wrapper }
        )

        const studentText = await screen.findByText(
          /\*You have 1 active student that does not count towards the number of active users./
        )
        expect(studentText).toBeInTheDocument()
      })
    })

    describe('when there are two or more students', () => {
      beforeEach(() => setup())

      it('renders text for two or more student not taking active seats', async () => {
        render(
          <SentryUpgradeForm
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: sentryPlanMonth,
              latestInvoice: null,
              activatedStudentCount: 3,
            }}
          />,
          { wrapper }
        )

        const studentText = await screen.findByText(
          /\*You have 3 active students that do not count towards the number of active users./
        )
        expect(studentText).toBeInTheDocument()
      })
    })
  })

  describe('if there is an invoice', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the next billing period', async () => {
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: sentryPlanMonth,
            latestInvoice: {
              periodStart: 1595270468,
              periodEnd: 1597948868,
              dueDate: '1600544863',
              amountPaid: 9600.0,
              amountDue: 9600.0,
              amountRemaining: 0.0,
              total: 9600.0,
              subtotal: 9600.0,
              invoicePdf:
                'https://pay.stripe.com/invoice/acct_14SJTOGlVGuVgOrk/invst_Hs2qfFwArnp6AMjWPlwtyqqszoBzO3q/pdf',
            },
          }}
        />,
        { wrapper }
      )

      const nextBillingData = await screen.findByText(/Next Billing Date/)
      expect(nextBillingData).toBeInTheDocument()

      const billingDate = await screen.findByText(/August 20th, 2020/)
      expect(billingDate).toBeInTheDocument()
    })
  })

  describe('when the user leave the nb of seats blank', () => {
    it('displays an error', async () => {
      const { user } = setup()
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: null,
            latestInvoice: null,
          }}
        />,
        { wrapper }
      )

      const input = await screen.findByRole('spinbutton')
      await user.type(input, '{backspace}{backspace}{backspace}')

      const updateButton = await screen.findByRole('button', { name: 'Update' })
      await user.click(updateButton)

      const error = await screen.findByText(/Number of seats is required/)
      expect(error).toBeInTheDocument()
    })
  })

  describe('when the user chooses less than 5 seats', () => {
    it('displays an error', async () => {
      const { user } = setup()
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: null,
            latestInvoice: null,
          }}
        />,
        { wrapper }
      )

      let input = await screen.findByRole('spinbutton')
      await user.type(input, '{backspace}{backspace}{backspace}')
      input = await screen.findByRole('spinbutton')
      await user.type(input, '1')

      const updateButton = await screen.findByRole('button', { name: 'Update' })
      await user.click(updateButton)

      const error = screen.getByText(
        /You cannot purchase a per user plan for less than 5 users/
      )
      expect(error).toBeInTheDocument()
    })
  })

  describe('when the user chooses less than the number of active users', () => {
    it('displays an error', async () => {
      const { user } = setup()
      render(
        <SentryUpgradeForm
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          accountDetails={{
            activatedUserCount: 9,
            inactiveUserCount: 0,
            plan: null,
            latestInvoice: null,
          }}
        />,
        { wrapper }
      )

      let input = await screen.findByRole('spinbutton')
      await user.type(input, '{backspace}{backspace}{backspace}')
      input = await screen.findByRole('spinbutton')
      await user.type(input, '8')

      const updateButton = await screen.findByRole('button', { name: 'Update' })
      await user.click(updateButton)

      const error = await screen.findByText(
        /deactivate more users before downgrading plans/i
      )
      expect(error).toBeInTheDocument()
    })
  })

  describe('when clicking on the button to upgrade', () => {
    describe('when mutation is successful', () => {
      it('adds a success notification', async () => {
        const { user, addNotification } = setup()
        render(
          <SentryUpgradeForm
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: null,
              latestInvoice: null,
            }}
          />,
          { wrapper }
        )

        let input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        input = await screen.findByRole('spinbutton')
        await user.type(input, '20')

        const updateButton = await screen.findByRole('button', {
          name: 'Update',
        })
        await user.click(updateButton)

        await waitFor(() =>
          expect(addNotification).toHaveBeenCalledWith({
            type: 'success',
            text: 'Plan successfully upgraded',
          })
        )
      })

      it('redirects the user to the plan page', async () => {
        const { user } = setup()
        render(
          <SentryUpgradeForm
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: null,
              latestInvoice: null,
            }}
          />,
          { wrapper }
        )

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '20')

        const updateButton = await screen.findByRole('button', {
          name: 'Update',
        })
        await user.click(updateButton)

        await waitFor(() =>
          expect(testLocation.pathname).toEqual('/plan/gh/codecov')
        )
      })
    })

    describe('when mutation is not successful', () => {
      describe('an error message is provided', () => {
        it('adds an error notification with detail message', async () => {
          const { user, addNotification } = setup(false, 'Insufficient funds.')
          render(
            <SentryUpgradeForm
              sentryPlanMonth={sentryPlanMonth}
              sentryPlanYear={sentryPlanYear}
              accountDetails={{
                activatedUserCount: 9,
                inactiveUserCount: 0,
                plan: null,
                latestInvoice: null,
              }}
            />,
            { wrapper }
          )

          let input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          input = await screen.findByRole('spinbutton')
          await user.type(input, '20')

          const updateButton = await screen.findByRole('button', {
            name: 'Update',
          })
          await user.click(updateButton)

          await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
              type: 'error',
              text: 'Insufficient funds.',
            })
          )
        })
      })

      describe('no error message is provided', () => {
        it('adds an error notification with a default message', async () => {
          const { user, addNotification } = setup(false)

          render(
            <SentryUpgradeForm
              sentryPlanMonth={sentryPlanMonth}
              sentryPlanYear={sentryPlanYear}
              accountDetails={{
                activatedUserCount: 9,
                inactiveUserCount: 0,
                plan: null,
                latestInvoice: null,
              }}
            />,
            { wrapper }
          )

          let input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          input = await screen.findByRole('spinbutton')
          await user.type(input, '20')

          const updateButton = await screen.findByRole('button', {
            name: 'Update',
          })
          await user.click(updateButton)

          await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
              type: 'error',
              text: 'Something went wrong',
            })
          )
        })
      })
    })
  })
})
