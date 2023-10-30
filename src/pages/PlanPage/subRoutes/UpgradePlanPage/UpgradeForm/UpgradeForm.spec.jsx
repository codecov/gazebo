import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { useAddNotification } from 'services/toastNotification'
import { Plans } from 'shared/utils/billing'

import UpgradeForm from './UpgradeForm'

jest.mock('services/toastNotification')
jest.mock('@stripe/react-stripe-js')

const freePlan = {
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
  monthlyUploadLimit: 250,
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
  monthlyUploadLimit: null,
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
  monthlyUploadLimit: null,
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
  monthlyUploadLimit: null,
  trialDays: 14,
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
  monthlyUploadLimit: null,
  quantity: 10,
}

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  planName: 'users-basic',
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
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

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

const wrapper =
  (initialEntries = ['/gh/codecov']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner">
            <Suspense fallback={null}>{children}</Suspense>
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

describe('UpgradeForm', () => {
  function setup(
    {
      successfulRequest = true,
      errorDetails = undefined,
      includeSentryPlans = false,
      trialStatus = undefined,
    } = {
      successfulRequest: true,
      errorDetails: undefined,
      includeSentryPlans: false,
      trialStatus: undefined,
    }
  ) {
    const addNotification = jest.fn()
    const user = userEvent.setup()
    const patchRequest = jest.fn()

    useAddNotification.mockReturnValue(addNotification)

    server.use(
      graphql.query('GetPlanData', (_, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: { plan: { ...mockPlanData, trialStatus: trialStatus } },
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
      graphql.query('GetAvailablePlans', (req, res, ctx) => {
        if (includeSentryPlans) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                availablePlans: [
                  freePlan,
                  proPlanMonth,
                  proPlanYear,
                  sentryPlanMonth,
                  sentryPlanYear,
                ],
              },
            })
          )
        } else {
          return res(
            ctx.status(200),
            ctx.data({
              owner: { availablePlans: [freePlan, proPlanMonth, proPlanYear] },
            })
          )
        }
      })
    )

    return { addNotification, user, patchRequest }
  }

  describe('user does not have access to sentry upgrade', () => {
    describe('when the user does not have any plan', () => {
      const props = {
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
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders the seat input with 2 seats', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const numberInput = await screen.findByRole('spinbutton')
        expect(numberInput).toBeInTheDocument()
        expect(numberInput).toHaveValue(2)
      })
    })

    describe('when the user have a free plan', () => {
      const props = {
        proPlanMonth,
        proPlanYear,
        accountDetails: {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: freePlan,
          latestInvoice: null,
        },
      }

      it('renders annual option button as "selected"', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 9 seats', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const numberInput = await screen.findByRole('spinbutton')
        expect(numberInput).toHaveValue(9)
      })
    })

    describe('when the user have a pro year plan', () => {
      const props = {
        proPlanMonth,
        proPlanYear,
        accountDetails: {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: proPlanYear,
          latestInvoice: null,
        },
      }

      it('renders annual option button to be "selection"', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 10 seats (existing subscription)', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const seatCount = await screen.findByRole('spinbutton')
        expect(seatCount).toHaveValue(10)
      })

      it('has the price for the year', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$1,200/)
        expect(price).toBeInTheDocument()
      })

      it('has the update button disabled', async () => {
        setup()
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const update = await screen.findByText(/Update/)
        expect(update).toBeDisabled()
      })

      describe('when updating to a month plan', () => {
        it('has the price for the month', async () => {
          const { user } = setup()
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const monthOption = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(monthOption)

          const price = screen.getByText(/\$120/)
          expect(price).toBeInTheDocument()
        })
      })
    })

    describe('when the user have a pro year monthly', () => {
      describe('user clicks select annual', () => {
        it('renders annual option button to be "selected', async () => {
          const { user } = setup()
          render(
            <UpgradeForm
              proPlanMonth={proPlanMonth}
              proPlanYear={proPlanYear}
              accountDetails={{
                activatedUserCount: 9,
                inactiveUserCount: 0,
                plan: proPlanMonth,
                latestInvoice: null,
              }}
            />,
            { wrapper: wrapper() }
          )

          const switchAnnual = await screen.findByText('switch to annual')
          await user.click(switchAnnual)

          const annualOption = await screen.findByRole('button', {
            name: 'Annual',
          })
          expect(annualOption).toBeInTheDocument()
          expect(annualOption).toHaveClass('bg-ds-primary-base')
        })
      })
    })

    describe('if there is an invoice', () => {
      it('renders the next billing period', async () => {
        setup()
        render(
          <UpgradeForm
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: null,
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
          { wrapper: wrapper() }
        )

        const nextBillingData = await screen.findByText(/Next Billing Date/)
        expect(nextBillingData).toBeInTheDocument()

        const billingDate = await screen.findByText(/August 20th, 2020/)
        expect(billingDate).toBeInTheDocument()
      })
    })

    describe('when the user chooses less than 2 seats', () => {
      it('displays an error', async () => {
        const { user } = setup()
        render(
          <UpgradeForm
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: null,
              latestInvoice: null,
            }}
          />,
          { wrapper: wrapper() }
        )

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '1')

        const updateButton = await screen.findByRole('button', {
          name: 'Update',
        })
        await user.click(updateButton)

        const error = screen.getByText(
          /You cannot purchase a per user plan for less than 2 users/
        )
        expect(error).toBeInTheDocument()
      })
    })

    describe('when the user chooses less than the number of active users', () => {
      it('displays an error', async () => {
        const { user } = setup()
        render(
          <UpgradeForm
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: null,
              latestInvoice: null,
            }}
          />,
          { wrapper: wrapper() }
        )

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
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

      it('renders plan', async () => {
        setup({ includeSentryPlans: true, trialStatus: 'NOT_STARTED' })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const planDetails = await screen.findByRole('heading', {
          name: 'Plan',
        })
        expect(planDetails).toBeInTheDocument()

        const standardSeats = await screen.findByText(
          '$29 monthly includes 5 seats.'
        )
        expect(standardSeats).toBeInTheDocument()
      })

      it('renders billing', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const billing = await screen.findByText('Billing')
        expect(billing).toBeInTheDocument()
      })

      it('renders monthly option button', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const monthlyOption = await screen.findByRole('button', {
          name: 'Monthly',
        })
        expect(monthlyOption).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const annualOption = await screen.findByRole('button', {
          name: 'Annual',
        })
        expect(annualOption).toBeInTheDocument()
      })

      it('renders the seat input with 5 seats', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const numberInput = await screen.findByRole('spinbutton')
        expect(numberInput).toBeInTheDocument()
        expect(numberInput).toHaveValue(5)
      })
    })

    describe('when the user have a free plan', () => {
      const props = {
        proPlanMonth,
        proPlanYear,
        sentryPlanMonth,
        sentryPlanYear,
        accountDetails: {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: freePlan,
          latestInvoice: null,
        },
      }

      it('renders annual option as "selected"', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const annualOption = await screen.findByRole('button', {
          name: 'Annual',
        })
        expect(annualOption).toBeInTheDocument()
        expect(annualOption).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 9 seats', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const numberInput = await screen.findByRole('spinbutton')
        expect(numberInput).toHaveValue(9)
      })
    })

    describe('when the user have a sentry pro year plan', () => {
      const props = {
        proPlanMonth,
        proPlanYear,
        sentryPlanMonth,
        sentryPlanYear,
        accountDetails: {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: sentryPlanYear,
          latestInvoice: null,
        },
      }

      it('renders annual option to be "selected"', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 10 seats (existing subscription)', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const seatCount = await screen.findByRole('spinbutton')
        expect(seatCount).toHaveValue(10)
      })

      it('has the price for the year', async () => {
        setup({ includeSentryPlans: true })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$948.00/)
        expect(price).toBeInTheDocument()
      })

      it('has the update button disabled', async () => {
        setup({ includeSentryPlans: true, trialStatus: TrialStatuses.ONGOING })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const update = await screen.findByText(/Update/)
        expect(update).toBeDisabled()
      })

      describe('when updating to a month plan', () => {
        it('has the price for the month', async () => {
          const { user } = setup({ includeSentryPlans: true })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const monthOption = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(monthOption)

          const price = screen.getByText(/\$120/)
          expect(price).toBeInTheDocument()
        })
      })
    })

    describe('when the user have a sentry pro monthly', () => {
      describe('user clicks select annual', () => {
        it('renders annual option to be "selected"', async () => {
          const { user } = setup({ includeSentryPlans: true })

          render(
            <UpgradeForm
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
            { wrapper: wrapper() }
          )

          const switchAnnual = await screen.findByText('switch to annual')
          await user.click(switchAnnual)

          const annualOption = await screen.findByRole('button', {
            name: 'Annual',
          })
          expect(annualOption).toHaveClass('bg-ds-primary-base')
        })
      })
    })

    describe('if there is an invoice', () => {
      it('renders the next billing period', async () => {
        setup({ includeSentryPlans: true })
        render(
          <UpgradeForm
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: null,
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
          { wrapper: wrapper() }
        )

        const nextBillingData = await screen.findByText(/Next Billing Date/)
        expect(nextBillingData).toBeInTheDocument()

        const billingDate = await screen.findByText(/August 20th, 2020/)
        expect(billingDate).toBeInTheDocument()
      })
    })

    describe('when the user chooses less than 5 seats', () => {
      it('displays an error', async () => {
        const { user } = setup({
          includeSentryPlans: true,
          trialStatus: TrialStatuses.ONGOING,
        })
        render(
          <UpgradeForm
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: null,
              latestInvoice: null,
            }}
          />,
          { wrapper: wrapper() }
        )

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '1')

        const updateButton = await screen.findByRole('button', {
          name: 'Update',
        })
        await user.click(updateButton)

        const error = screen.getByText(
          /You cannot purchase a per user plan for less than 5 users/
        )
        expect(error).toBeInTheDocument()
      })
    })

    describe('user is currently on a trial', () => {
      describe('user chooses less than the number of active users', () => {
        it('does not display an error', async () => {
          const { user } = setup({
            includeSentryPlans: true,
            trialStatus: TrialStatuses.ONGOING,
          })

          render(
            <UpgradeForm
              proPlanMonth={proPlanMonth}
              proPlanYear={proPlanYear}
              sentryPlanMonth={sentryPlanMonth}
              sentryPlanYear={sentryPlanYear}
              accountDetails={{
                activatedUserCount: 9,
                inactiveUserCount: 0,
                plan: { value: Plans.USERS_TRIAL },
                latestInvoice: null,
              }}
            />,
            { wrapper: wrapper() }
          )

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '8')

          const updateButton = await screen.findByRole('button', {
            name: 'Update',
          })
          await user.click(updateButton)

          await waitFor(() => queryClient.isMutating)
          await waitFor(() => !queryClient.isMutating)

          const error = screen.queryByText(
            /deactivate more users before downgrading plans/i
          )
          expect(error).not.toBeInTheDocument()
        })
      })
    })
  })

  describe('display student info', () => {
    describe('when there are no students', () => {
      it('renders text for 1 student not taking active seats', async () => {
        setup()
        render(
          <UpgradeForm
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: freePlan,
              latestInvoice: null,
              activatedStudentCount: 0,
            }}
          />,
          { wrapper: wrapper() }
        )

        const singleStudentText = screen.queryByText(
          /\*You have 1 active student that does not count towards the number of active users./
        )
        expect(singleStudentText).not.toBeInTheDocument()

        const multiStudentText = screen.queryByText(
          /\*You have 3 active students that do not count towards the number of active users./
        )
        expect(multiStudentText).not.toBeInTheDocument()
      })
    })

    describe('when there is a single student', () => {
      it('renders text for 1 student not taking active seats', async () => {
        setup()
        render(
          <UpgradeForm
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: freePlan,
              latestInvoice: null,
              activatedStudentCount: 1,
            }}
          />,
          { wrapper: wrapper() }
        )

        const studentText = await screen.findByText(
          /\*You have 1 active student that does not count towards the number of active users./
        )
        expect(studentText).toBeInTheDocument()
      })
    })

    describe('when there are two or more students', () => {
      it('renders text for two or more student not taking active seats', async () => {
        setup()
        render(
          <UpgradeForm
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            accountDetails={{
              activatedUserCount: 9,
              inactiveUserCount: 0,
              plan: freePlan,
              latestInvoice: null,
              activatedStudentCount: 3,
            }}
          />,
          { wrapper: wrapper() }
        )

        const studentText = await screen.findByText(
          /\*You have 3 active students that do not count towards the number of active users./
        )
        expect(studentText).toBeInTheDocument()
      })
    })
  })

  describe('when clicking on the button to upgrade', () => {
    const props = {
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
      it('makes a patch request with the correct values', async () => {
        const { patchRequest, user } = setup()
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
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
        const { addNotification, user } = setup()
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
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
        let testLocation
        render(
          <>
            <UpgradeForm {...props} />
            <Route
              path="*"
              render={({ location }) => {
                testLocation = location
                return null
              }}
            />
          </>,
          { wrapper: wrapper(['/plan/gh/codecov']) }
        )

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '20')

        const updateButton = await screen.findByRole('button', {
          name: 'Update',
        })
        await user.click(updateButton)

        await waitFor(() => queryClient.isMutating())
        await waitFor(() => !queryClient.isMutating())
        await waitFor(() => queryClient.isFetching())
        await waitFor(() => !queryClient.isFetching())

        expect(testLocation.pathname).toEqual('/plan/gh/codecov')
      })
    })

    describe('when mutation is not successful', () => {
      describe('an error message is provided', () => {
        it('adds an error notification with detail message', async () => {
          const { addNotification, user } = setup({
            successfulRequest: false,
            errorDetails: 'Insufficient funds.',
          })

          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const updateButton = await screen.findByRole('button', {
            name: 'Update',
          })
          await user.click(updateButton)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => !queryClient.isFetching())

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
          const { addNotification, user } = setup({
            successfulRequest: false,
          })

          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const updateButton = await screen.findByRole('button', {
            name: 'Update',
          })
          await user.click(updateButton)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => !queryClient.isFetching())

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
