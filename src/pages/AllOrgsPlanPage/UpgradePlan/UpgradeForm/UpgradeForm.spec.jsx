import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import { TrialStatuses } from 'services/trial'

import UpgradeForm from './UpgradeForm'

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

const proPlanMonth = {
  marketingName: 'Pro Team',
  value: 'users-pr-inappm',
  billingRate: 'monthly',
  baseUnitPrice: 12,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  quantity: 10,
}

const proPlanYear = {
  marketingName: 'Pro Team',
  value: 'users-pr-inappy',
  billingRate: 'annually',
  baseUnitPrice: 10,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  quantity: 10,
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
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
  logger: {
    error: () => {},
  },
})
const server = setupServer()

let testLocation
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/gh']}>
      <Route path="/plan/:provider">
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

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('UpgradeForm', () => {
  function setup(
    {
      successfulRequest = true,
      errorDetails = undefined,
      includeSentryPlans = false,
      trialStatus = null,
    } = {
      successfulRequest: true,
      errorDetails: undefined,
      includeSentryPlans: false,
      trialStatus: null,
    }
  ) {
    const user = userEvent.setup()
    const addNotification = jest.fn()
    const patchRequest = jest.fn()

    useAddNotification.mockReturnValue(addNotification)

    server.use(
      graphql.query('GetTrialData', (_, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: { trialStatus },
          })
        )
      ),
      rest.patch(
        '/internal/gh/codecov/account-details/',
        async (req, res, ctx) => {
          if (!successfulRequest) {
            if (errorDetails) {
              return res(ctx.status(500), ctx.json({ detail: errorDetails }))
            }
            return res(ctx.status(500), ctx.json({ success: false }))
          }
          const body = await req.json()
          patchRequest(body)

          return res(ctx.status(200), ctx.json({ success: true }))
        }
      ),
      rest.get('internal/plans', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([
            basicPlan,
            proPlanMonth,
            proPlanYear,
            ...(includeSentryPlans ? [sentryPlanMonth, sentryPlanYear] : []),
          ])
        )
      })
    )

    return { user, addNotification, patchRequest }
  }

  describe('when the user does not have access to sentry plan', () => {
    describe('when the user does not have any plan', () => {
      const props = {
        organizationName: 'codecov',
        proPlanMonth,
        proPlanYear,
        accountDetails: {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: null,
          latestInvoice: null,
        },
      }

      it('renders monthly option button', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).not.toBeDisabled()
      })

      it('renders annual option button', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).not.toBeDisabled()
      })

      it('renders the seat input with 2 seats', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const numberInput = await screen.findByRole('spinbutton')
        expect(numberInput).toBeInTheDocument()
        expect(numberInput).toHaveValue(2)
        expect(numberInput).not.toBeDisabled()
      })
    })

    describe('when no organization name or account details are not provided', () => {
      const props = { proPlanMonth, proPlanYear }

      it('renders monthly option button', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toBeDisabled()
      })

      it('renders annual option button', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toBeDisabled()
      })

      it('renders the seat input with 2 seats', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const numberInput = await screen.findByRole('spinbutton')
        expect(numberInput).toBeInTheDocument()
        expect(numberInput).toHaveValue(2)
        expect(numberInput).toBeDisabled()
      })

      it('has the update button disabled', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const update = await screen.findByText(/Update/)
        expect(update).toBeDisabled()
      })
    })

    describe('when the user have a free plan', () => {
      const props = {
        organizationName: 'codecov',
        proPlanMonth,
        proPlanYear,
        accountDetails: {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: null,
          latestInvoice: null,
        },
      }

      it('renders annual option as "select"', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 2 seats', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const numberInput = await screen.findByRole('spinbutton')
        expect(numberInput).toHaveValue(2)
      })
    })

    describe('when the user have a pro year plan', () => {
      const props = {
        organizationName: 'codecov',
        proPlanMonth,
        proPlanYear,
        accountDetails: {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: proPlanYear,
          latestInvoice: null,
        },
      }

      it('renders annual option to be "selected"', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 10 seats (existing subscription)', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const seatCount = await screen.findByRole('spinbutton')
        expect(seatCount).toHaveValue(10)
      })

      it('has the price for the year', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const price = await screen.findByText(/\$1,200/)
        expect(price).toBeInTheDocument()
      })

      it('has the update button disabled', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const update = await screen.findByText(/Update/)
        expect(update).toBeDisabled()
      })

      describe('when updating to a month plan', () => {
        it('has the price for the month', async () => {
          const { user } = setup()
          render(<UpgradeForm {...props} />, { wrapper })

          const monthlyOption = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(monthlyOption)

          const price = screen.getByText(/\$120/)
          expect(price).toBeInTheDocument()
        })
      })
    })

    describe('when the user have a pro year plan but no billing information during a trial', () => {
      const props = {
        organizationName: 'codecov',
        proPlanMonth,
        proPlanYear,
        accountDetails: {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: proPlanYear,
          latestInvoice: null,
        },
      }

      it('renders annual option to be "selected"', () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const optionBtn = screen.queryByRole('button', { name: 'Annual' })
        expect(optionBtn).not.toBeInTheDocument()
      })

      it('does not have the update button', () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper })

        const update = screen.queryByText(/Update/)
        expect(update).not.toBeInTheDocument()
      })

      it('prompts the user to input their billing information', async () => {
        setup({ includeSentryPlans: true, trialStatus: TrialStatuses.ONGOING })
        render(<UpgradeForm {...props} />, { wrapper })

        const billingInformationAnchor = await screen.findByText(
          /Proceed with plan and input billing information/
        )
        expect(billingInformationAnchor).toBeInTheDocument()
        expect(billingInformationAnchor.href).toBe(
          'https://billing.stripe.com/p/login/aEU00i9by3V4caQ6oo'
        )
      })
    })

    describe('when the user have a pro year monthly', () => {
      describe('user clicks select annual', () => {
        it('renders annual option to be "selected"', async () => {
          const { user } = setup()
          render(
            <UpgradeForm
              organizationName="codecov"
              proPlanMonth={proPlanMonth}
              proPlanYear={proPlanYear}
              accountDetails={{
                activatedUserCount: 9,
                inactiveUserCount: 0,
                plan: proPlanMonth,
                latestInvoice: null,
              }}
            />,
            { wrapper }
          )

          const switchAnnual = await screen.findByText('switch to annual')
          await user.click(switchAnnual)

          const optionBtn = await screen.findByRole('button', {
            name: 'Annual',
          })
          expect(optionBtn).toBeInTheDocument()
          expect(optionBtn).toHaveClass('bg-ds-primary-base')
        })
      })
    })

    describe('if there is an invoice', () => {
      beforeEach(() => {
        setup()
      })

      it('renders the next billing period', async () => {
        render(
          <UpgradeForm
            organizationName="codecov"
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: proPlanMonth,
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

    describe('when the user chooses less than the number of active users', () => {
      it('displays an error', async () => {
        const { user } = setup()
        render(
          <UpgradeForm
            organizationName="codecov"
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
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

        const updateButton = await screen.findByRole('button', {
          name: 'Update',
        })
        await user.click(updateButton)

        const error = await screen.findByText(
          /deactivate more users before downgrading plans/i
        )
        expect(error).toBeInTheDocument()
      })
    })
  })

  describe('user has access to sentry upgrade', () => {
    describe('when the user does not have any plan', () => {
      const props = {
        organizationName: 'codecov',
        proPlanMonth,
        proPlanYear,
        sentryPlanMonth,
        sentryPlanYear,
        accountDetails: {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: null,
          latestInvoice: null,
        },
      }

      it('renders monthly option button', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).not.toHaveClass('bg-ds-primary-base')
      })

      it('renders annual option button', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 5 seats', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper })

        const numberInput = await screen.findByRole('spinbutton')
        expect(numberInput).toBeInTheDocument()
        expect(numberInput).toHaveValue(5)
        expect(numberInput).not.toBeDisabled()
      })
    })

    describe('when no organization name or account details are not provided', () => {
      const props = {
        proPlanMonth,
        proPlanYear,
        sentryPlanMonth,
        sentryPlanYear,
      }

      it('renders monthly option button', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toBeDisabled()
      })

      it('renders annual option button', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toBeDisabled()
      })

      it('renders the seat input with 5 seats', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper })

        const numberInput = await screen.findByRole('spinbutton')
        expect(numberInput).toBeInTheDocument()
        expect(numberInput).toHaveValue(5)
        expect(numberInput).toBeDisabled()
      })

      it('has the update button disabled', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper })

        const update = await screen.findByText(/Update/)
        expect(update).toBeDisabled()
      })
    })

    describe('when the user have a free plan', () => {
      const props = {
        organizationName: 'codecov',
        proPlanMonth,
        proPlanYear,
        sentryPlanMonth,
        sentryPlanYear,
        accountDetails: {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: basicPlan,
          latestInvoice: null,
        },
      }

      it('renders annual option button', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 9 seats', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper })

        const numberInput = await screen.findByRole('spinbutton')
        expect(numberInput).toHaveValue(9)
      })
    })

    describe('when the user have a sentry year plan', () => {
      const props = {
        organizationName: 'codecov',
        proPlanMonth,
        proPlanYear,
        sentryPlanMonth,
        sentryPlanYear,
        accountDetails: {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: sentryPlanYear,
          latestInvoice: null,
          subscriptionDetail: {
            defaultPaymentMethod: {
              billingDetails: {},
              card: { brand: 'visa' },
            },
          },
        },
      }

      it('renders annual option to be "selected"', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 10 seats (existing subscription)', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper })

        const seatCount = await screen.findByRole('spinbutton')
        expect(seatCount).toHaveValue(10)
      })

      it('has the price for the year', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper })

        const price = await screen.findByText(/\$948/)
        expect(price).toBeInTheDocument()
      })

      it('has the update button disabled', async () => {
        setup({ includeSentryPlans: true, trialStatus: TrialStatuses.ONGOING })
        render(<UpgradeForm {...props} />, { wrapper })

        const update = await screen.findByText(/Update/)
        expect(update).toBeDisabled()
      })

      describe('when updating to a month plan', () => {
        it('has the price for the month', async () => {
          const { user } = setup({ includeSentryPlans: true })
          render(<UpgradeForm {...props} />, { wrapper })

          const monthOption = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(monthOption)

          const price = screen.getByText(/\$89/)
          expect(price).toBeInTheDocument()
        })
      })
    })

    describe('when the user have a sentry year monthly', () => {
      describe('user clicks select annual', () => {
        it('renders annual option to be "selected"', async () => {
          const { user } = setup({ includeSentryPlans: true })
          render(
            <UpgradeForm
              organizationName="codecov"
              proPlanMonth={proPlanMonth}
              proPlanYear={proPlanYear}
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

          const optionBtn = await screen.findByRole('button', {
            name: 'Annual',
          })
          expect(optionBtn).toBeInTheDocument()
          await waitFor(() =>
            expect(optionBtn).toHaveClass('bg-ds-primary-base')
          )
        })
      })
    })

    describe('if there is an invoice', () => {
      beforeEach(() => {
        setup({ includeSentryPlans: true })
      })

      it('renders the next billing period', async () => {
        render(
          <UpgradeForm
            organizationName="codecov"
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
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

    describe('when the user chooses less than the number of active users', () => {
      it('displays an error', async () => {
        const { user } = setup({
          includeSentryPlans: true,
          trialStatus: TrialStatuses.ONGOING,
        })
        render(
          <UpgradeForm
            organizationName="codecov"
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: null,
              latestInvoice: null,
              subscriptionDetail: {
                defaultPaymentMethod: {
                  billingDetails: {},
                  card: { brand: 'visa' },
                },
              },
            }}
          />,
          { wrapper }
        )

        let input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        input = await screen.findByRole('spinbutton')
        await user.type(input, '8')

        const updateButton = await screen.findByRole('button', {
          name: 'Update',
        })
        await user.click(updateButton)

        const error = await screen.findByText(
          /deactivate more users before downgrading plans/i
        )
        expect(error).toBeInTheDocument()
      })
    })
  })

  describe('when clicking on the button to upgrade', () => {
    const props = {
      organizationName: 'codecov',
      proPlanMonth,
      proPlanYear,
      accountDetails: {
        activatedUserCount: 9,
        inactiveUserCount: 0,
        plan: null,
        latestInvoice: null,
      },
    }

    describe('when mutation is successful', () => {
      it('makes a patch request with the right values', async () => {
        const { user, patchRequest } = setup()
        render(<UpgradeForm {...props} />, { wrapper })

        let input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        input = await screen.findByRole('spinbutton')
        await user.type(input, '20')

        const updateButton = await screen.findByRole('button', {
          name: 'Update',
        })
        await user.click(updateButton)

        await waitFor(() =>
          expect(patchRequest).toHaveBeenCalledWith({
            plan: {
              quantity: 20,
              value: 'users-pr-inappy',
            },
          })
        )
      })

      it('adds a success notification', async () => {
        const { user, addNotification } = setup()
        render(<UpgradeForm {...props} />, { wrapper })

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
        render(<UpgradeForm {...props} />, { wrapper })

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
          const { user, addNotification } = setup({
            successfulRequest: false,
            errorDetails: 'Insufficient funds.',
          })
          render(<UpgradeForm {...props} />, { wrapper })

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
          const { user, addNotification } = setup({
            successfulRequest: false,
          })

          render(<UpgradeForm {...props} />, { wrapper })

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

  describe('when the customer has not started a trial', () => {
    const props = {
      organizationName: 'codecov',
      proPlanMonth,
      proPlanYear,
      sentryPlanMonth,
      sentryPlanYear,
      accountDetails: {
        activatedUserCount: 9,
        inactiveUserCount: 0,
        plan: null,
        latestInvoice: null,
      },
    }

    it('renders monthly option button', async () => {
      setup({
        includeSentryPlans: true,
        trialStatus: TrialStatuses.NOT_STARTED,
      })
      render(<UpgradeForm {...props} />, { wrapper })

      const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
      expect(optionBtn).toBeInTheDocument()
      expect(optionBtn).not.toHaveClass('bg-ds-primary-base')
    })

    it('renders annual option button', async () => {
      setup({
        includeSentryPlans: true,
        trialStatus: TrialStatuses.NOT_STARTED,
      })
      render(<UpgradeForm {...props} />, { wrapper })

      const optionBtn = await screen.findByRole('button', { name: 'Annual' })
      expect(optionBtn).toBeInTheDocument()
      expect(optionBtn).toHaveClass('bg-ds-primary-base')
    })

    it('renders the seat input with 5 seats', async () => {
      setup({
        includeSentryPlans: true,
        trialStatus: TrialStatuses.NOT_STARTED,
      })
      render(<UpgradeForm {...props} />, { wrapper })

      const numberInput = await screen.findByRole('spinbutton')
      expect(numberInput).toBeInTheDocument()
      expect(numberInput).toHaveValue(5)
      expect(numberInput).not.toBeDisabled()
    })

    it('renders the trial fields', async () => {
      setup({
        includeSentryPlans: true,
        trialStatus: TrialStatuses.NOT_STARTED,
      })
      render(<UpgradeForm {...props} />, { wrapper })

      const startTrial = await screen.findByRole('button', {
        name: 'Start trial',
      })
      expect(startTrial).toBeInTheDocument()

      const creditCardInfo = await screen.findByText('No credit card required!')
      expect(creditCardInfo).toBeInTheDocument()
    })
  })
})
