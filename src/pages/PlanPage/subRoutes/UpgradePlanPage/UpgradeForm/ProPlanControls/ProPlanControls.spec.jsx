import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { useAddNotification } from 'services/toastNotification'
import { useFlags } from 'shared/featureFlags'
import { Plans } from 'shared/utils/billing'

import ProPlanControls from './ProPlanControls'

jest.mock('services/toastNotification')
jest.mock('@stripe/react-stripe-js')
jest.mock('shared/featureFlags')

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
  monthlyUploadLimit: 250,
}

const proPlanMonth = {
  marketingName: 'Pro',
  value: Plans.USERS_PR_INAPPM,
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

const proPlanYear = {
  marketingName: 'Pro',
  value: Plans.USERS_PR_INAPPY,
  billingRate: 'annually',
  baseUnitPrice: 10,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  quantity: 13,
}

const teamPlanMonth = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: 'monthly',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamm',
}

const teamPlanYear = {
  baseUnitPrice: 4,
  benefits: ['Up to 10 users'],
  billingRate: 'annually',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamy',
}

const trialPlan = {
  marketingName: 'Pro Trial Team',
  value: 'users-trial',
  billingRate: null,
  baseUnitPrice: 12,
  benefits: ['Configurable # of users', 'Unlimited repos'],
  monthlyUploadLimit: null,
}

const mockAccountDetailsBasic = {
  plan: basicPlan,
  activatedUserCount: 1,
  inactiveUserCount: 0,
}

const mockAccountDetailsProMonthly = {
  plan: proPlanMonth,
  activatedUserCount: 7,
  inactiveUserCount: 0,
  subscriptionDetail: {
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
  },
}

const mockAccountDetailsProYearly = {
  plan: proPlanYear,
  activatedUserCount: 11,
  inactiveUserCount: 0,
}

const mockAccountDetailsTrial = {
  plan: trialPlan,
  activatedUserCount: 28,
  inactiveUserCount: 0,
}

const mockPlanDataResponse = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Pro Team',
  monthlyUploadLimit: 250,
  value: 'test-plan',
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

let testLocation

const wrapper =
  (initialEntries = ['/gh/codecov']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner">
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

describe('ProPlanControls', () => {
  function setup(
    {
      planValue = Plans.USERS_BASIC,
      successfulPatchRequest = true,
      errorDetails = undefined,
      trialStatus = undefined,
      multipleTiers = false,
      hasTeamPlans = false,
    } = {
      planValue: Plans.USERS_BASIC,
      successfulPatchRequest: true,
      errorDetails: undefined,
      trialStatus: undefined,
      hasTeamPlans: false,
      multipleTiers: false,
    }
  ) {
    const addNotification = jest.fn()
    const user = userEvent.setup()
    const patchRequest = jest.fn()

    useAddNotification.mockReturnValue(addNotification)
    useFlags.mockReturnValue({ multipleTiers })

    server.use(
      rest.get(`/internal/gh/codecov/account-details/`, (req, res, ctx) => {
        if (planValue === Plans.USERS_BASIC) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsBasic))
        } else if (planValue === Plans.USERS_PR_INAPPM) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsProMonthly))
        } else if (planValue === Plans.USERS_PR_INAPPY) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsProYearly))
        } else if (planValue === Plans.USERS_TRIAL) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsTrial))
        }
      }),
      rest.patch(
        '/internal/gh/codecov/account-details/',
        async (req, res, ctx) => {
          if (!successfulPatchRequest) {
            if (errorDetails) {
              return res(ctx.status(500), ctx.json({ detail: errorDetails }))
            }
            return res(ctx.status(500), ctx.json({ success: false }))
          }
          const body = await req.json()

          patchRequest(body)

          return res(ctx.status(200), ctx.json({ success: false }))
        }
      ),
      graphql.query('GetAvailablePlans', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              availablePlans: [
                basicPlan,
                proPlanMonth,
                proPlanYear,
                trialPlan,
                ...(hasTeamPlans ? [teamPlanMonth, teamPlanYear] : []),
              ],
            },
          })
        )
      }),
      graphql.query('GetPlanData', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              plan: { ...mockPlanDataResponse, trialStatus },
            },
          })
        )
      })
    )

    return { addNotification, user, patchRequest }
  }

  describe('when rendered', () => {
    const props = {
      setSelectedPlan: jest.fn(),
      selectedPlan: Plans.USERS_PR_INAPPY,
    }
    describe('when the user has a basic plan', () => {
      it('renders the organization and owner titles', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const organizationTitle = await screen.findByText(/Organization/)
        expect(organizationTitle).toBeInTheDocument()
        const ownerTitle = await screen.findByText(/codecov/)
        expect(ownerTitle).toBeInTheDocument()
      })

      it('renders monthly option button', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button as "selected"', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('has the price for the year', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$240/)
        expect(price).toBeInTheDocument()
      })

      it('renders minimum seat number of 2', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const minimumSeat = await screen.findByRole('spinbutton')
        expect(minimumSeat).toHaveValue(2)
      })

      it('renders validation error when the user selects less than 2 seats', async () => {
        const { user } = setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '1')

        const proceedToCheckoutButton = await screen.findByRole('button', {
          name: /Proceed to Checkout/,
        })
        expect(proceedToCheckoutButton).toBeDisabled()

        const error = screen.getByText(
          /You cannot purchase a per user plan for less than 2 users/
        )
        expect(error).toBeInTheDocument()
      })

      it('renders the proceed to checkout for the update button', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const proceedToCheckoutButton = await screen.findByRole('button', {
          name: /Proceed to Checkout/,
        })
        expect(proceedToCheckoutButton).toBeInTheDocument()
      })

      describe.skip('when the user has team plans available', () => {
        describe('when the feature flag is off', () => {
          it('does not renders the Pro and team buttons', () => {
            setup({
              planValue: Plans.USERS_BASIC,
              hasTeamPlans: true,
              multipleTiers: false,
            })
            render(<ProPlanControls {...props} />, { wrapper: wrapper() })

            const proBtn = screen.queryByRole('button', { name: 'Pro' })
            expect(proBtn).not.toBeInTheDocument()
            const teamBtn = screen.queryByRole('button', { name: 'Team' })
            expect(teamBtn).not.toBeInTheDocument()
          })
        })

        describe('when the feature flag is on', () => {
          it('renders the Pro button as "selected"', async () => {
            setup({
              planValue: Plans.USERS_BASIC,
              hasTeamPlans: true,
              multipleTiers: true,
            })
            render(<ProPlanControls {...props} />, { wrapper: wrapper() })

            const optionBtn = await screen.findByRole('button', { name: 'Pro' })
            expect(optionBtn).toBeInTheDocument()
            expect(optionBtn).toHaveClass('bg-ds-primary-base')
          })

          it('renders team option button', async () => {
            setup({
              planValue: Plans.USERS_BASIC,
              hasTeamPlans: true,
              multipleTiers: true,
            })
            render(<ProPlanControls {...props} />, { wrapper: wrapper() })

            const optionBtn = await screen.findByRole('button', {
              name: 'Team',
            })
            expect(optionBtn).toBeInTheDocument()
          })

          describe('when updating to a team plan', () => {
            it('renders up to 10 seats text', async () => {
              const { user } = setup({
                planValue: Plans.USERS_BASIC,
                hasTeamPlans: true,
                multipleTiers: true,
              })
              render(<ProPlanControls {...props} />, { wrapper: wrapper() })

              const teamOption = await screen.findByRole('button', {
                name: 'Team',
              })
              await user.click(teamOption)

              const auxiliaryText = await screen.findByText(/Up to 10 users/)
              expect(auxiliaryText).toBeInTheDocument()
            })

            it('displays per month price when annual', async () => {
              const { user } = setup({
                planValue: Plans.USERS_BASIC,
                hasTeamPlans: true,
                multipleTiers: true,
              })
              render(<ProPlanControls {...props} />, { wrapper: wrapper() })

              const teamOption = await screen.findByRole('button', {
                name: 'Team',
              })
              await user.click(teamOption)

              const perMonthPrice = screen.getByText(/\$8.00/)
              expect(perMonthPrice).toBeInTheDocument()
            })

            it('displays billed annually at price', async () => {
              const { user } = setup({
                planValue: Plans.USERS_BASIC,
                hasTeamPlans: true,
                multipleTiers: true,
              })
              render(<ProPlanControls {...props} />, { wrapper: wrapper() })

              const teamOption = await screen.findByRole('button', {
                name: 'Team',
              })
              await user.click(teamOption)

              const annualPrice = screen.getByText(
                /\/per month billed annually at \$96.00/
              )
              expect(annualPrice).toBeInTheDocument()
            })
          })
        })
      })

      describe('when updating to a month plan', () => {
        it('has the price for the month', async () => {
          const { user } = setup({ planValue: Plans.USERS_BASIC })
          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const monthOption = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(monthOption)

          const price = screen.getByText(/\$48/)
          expect(price).toBeInTheDocument()
        })
      })

      describe('when the mutation is successful', () => {
        it('renders success notification when upgrading seats with yearly plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_BASIC,
          })
          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const proceedToCheckoutButton = await screen.findByRole('button', {
            name: /Proceed to Checkout/,
          })
          await user.click(proceedToCheckoutButton)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 20,
                value: Plans.USERS_PR_INAPPY,
              },
            })
          )
        })

        it('renders success notification when upgrading seats with monthly plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_BASIC,
          })
          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const optionBtn = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(optionBtn)

          const proceedToCheckoutButton = await screen.findByRole('button', {
            name: /Proceed to Checkout/,
          })
          await user.click(proceedToCheckoutButton)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 20,
                value: Plans.USERS_PR_INAPPM,
              },
            })
          )
        })

        it('redirects the user to the plan page', async () => {
          const { user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_BASIC,
          })
          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const proceedToCheckoutButton = await screen.findByRole('button', {
            name: /Proceed to Checkout/,
          })
          await user.click(proceedToCheckoutButton)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isFetching())

          expect(testLocation.pathname).toEqual('/plan/gh/codecov')
        })
      })

      describe('when the mutation is unsuccessful', () => {
        it('adds an error notification with detail message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            errorDetails: 'Insufficient funds.',
            planValue: Plans.USERS_BASIC,
          })

          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const proceedToCheckoutButton = await screen.findByRole('button', {
            name: /Proceed to Checkout/,
          })
          await user.click(proceedToCheckoutButton)

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

        it('adds an error notification with a default message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            planValue: Plans.USERS_BASIC,
          })

          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const proceedToCheckoutButton = await screen.findByRole('button', {
            name: /Proceed to Checkout/,
          })
          await user.click(proceedToCheckoutButton)

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

    describe('when the user has a pro plan monthly', () => {
      it('renders the organization and owner titles', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const organizationTitle = await screen.findByText(/Organization/)
        expect(organizationTitle).toBeInTheDocument()
        const ownerTitle = await screen.findByText(/codecov/)
        expect(ownerTitle).toBeInTheDocument()
      })

      it('renders monthly option button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders monthly option button as "selected"', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 10 seats (existing subscription)', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const seatCount = await screen.findByRole('spinbutton')
        expect(seatCount).toHaveValue(10)
      })

      it('has the price for the year', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$120/)
        expect(price).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than 2 seats', async () => {
        const { user } = setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '1')

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeDisabled()

        const error = screen.getByText(
          /You cannot purchase a per user plan for less than 2 users/
        )
        expect(error).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than number of active users', async () => {
        const { user } = setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '6')

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeDisabled()

        const error = screen.getByText(
          /deactivate more users before downgrading plans/i
        )
        expect(error).toBeInTheDocument()
      })

      it('renders the update button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeInTheDocument()
      })

      describe('when updating to a yearly plan', () => {
        it('has the price for the year', async () => {
          const { user } = setup({ planValue: Plans.USERS_PR_INAPPM })
          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const annualOption = await screen.findByRole('button', {
            name: 'Annual',
          })
          await user.click(annualOption)

          const price = screen.getByText(/\$100/)
          expect(price).toBeInTheDocument()
        })
      })

      describe.skip('when the user has team plans available', () => {
        describe('when the feature flag is off', () => {
          it('does not renders the Pro and team buttons', () => {
            setup({
              planValue: Plans.USERS_PR_INAPPM,
              hasTeamPlans: true,
              multipleTiers: false,
            })
            render(<ProPlanControls {...props} />, { wrapper: wrapper() })

            const proBtn = screen.queryByRole('button', { name: 'Pro' })
            expect(proBtn).not.toBeInTheDocument()
            const teamBtn = screen.queryByRole('button', { name: 'Team' })
            expect(teamBtn).not.toBeInTheDocument()
          })
        })

        describe('when the feature flag is on', () => {
          it('renders the Pro button as "selected"', async () => {
            setup({
              planValue: Plans.USERS_PR_INAPPM,
              hasTeamPlans: true,
              multipleTiers: true,
            })
            render(<ProPlanControls {...props} />, { wrapper: wrapper() })

            const optionBtn = await screen.findByRole('button', { name: 'Pro' })
            expect(optionBtn).toBeInTheDocument()
            expect(optionBtn).toHaveClass('bg-ds-primary-base')
          })

          it('renders team option button', async () => {
            setup({
              planValue: Plans.USERS_PR_INAPPM,
              hasTeamPlans: true,
              multipleTiers: true,
            })
            render(<ProPlanControls {...props} />, { wrapper: wrapper() })

            const optionBtn = await screen.findByRole('button', {
              name: 'Team',
            })
            expect(optionBtn).toBeInTheDocument()
          })

          describe('when updating to a team plan', () => {
            it('renders up to 10 seats text', async () => {
              const { user } = setup({
                planValue: Plans.USERS_PR_INAPPM,
                hasTeamPlans: true,
                multipleTiers: true,
              })
              render(<ProPlanControls {...props} />, { wrapper: wrapper() })

              const teamOption = await screen.findByRole('button', {
                name: 'Team',
              })
              await user.click(teamOption)

              const auxiliaryText = await screen.findByText(/Up to 10 users/)
              expect(auxiliaryText).toBeInTheDocument()
            })

            it('displays per month price when annual with quantity 10', async () => {
              const { user } = setup({
                planValue: Plans.USERS_PR_INAPPM,
                hasTeamPlans: true,
                multipleTiers: true,
              })
              render(<ProPlanControls {...props} />, { wrapper: wrapper() })

              const teamOption = await screen.findByRole('button', {
                name: 'Team',
              })
              await user.click(teamOption)

              const perMonthPrice = screen.getByText(/\$40.00/)
              expect(perMonthPrice).toBeInTheDocument()
            })

            it('displays billed annually at price', async () => {
              const { user } = setup({
                planValue: Plans.USERS_PR_INAPPM,
                hasTeamPlans: true,
                multipleTiers: true,
              })
              render(<ProPlanControls {...props} />, { wrapper: wrapper() })

              const teamOption = await screen.findByRole('button', {
                name: 'Team',
              })
              await user.click(teamOption)

              const annualPrice = screen.getByText(
                /\/per month billed annually at \$480.00/
              )
              expect(annualPrice).toBeInTheDocument()
            })
          })
        })
      })

      describe('when the mutation is successful', () => {
        it('renders success notification when upgrading seats with monthly plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPM,
          })
          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 20,
                value: Plans.USERS_PR_INAPPM,
              },
            })
          )
        })

        it('renders success notification when upgrading seats with yearly plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPM,
          })
          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const optionBtn = await screen.findByRole('button', {
            name: 'Annual',
          })
          await user.click(optionBtn)

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 20,
                value: Plans.USERS_PR_INAPPY,
              },
            })
          )
        })
      })

      describe('when the mutation is unsuccessful', () => {
        it('adds an error notification with detail message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            errorDetails: 'Insufficient funds.',
            planValue: Plans.USERS_PR_INAPPM,
          })

          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

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

        it('adds an error notification with a default message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            planValue: Plans.USERS_PR_INAPPM,
          })

          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

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

    describe('when the user has a pro plan yearly', () => {
      it('renders the organization and owner titles', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const organizationTitle = await screen.findByText(/Organization/)
        expect(organizationTitle).toBeInTheDocument()
        const ownerTitle = await screen.findByText(/codecov/)
        expect(ownerTitle).toBeInTheDocument()
      })

      it('renders monthly option button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button as "selected"', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 13 seats (existing subscription)', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const seatCount = await screen.findByRole('spinbutton')
        expect(seatCount).toHaveValue(13)
      })

      it('has the price for the year', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$130/)
        expect(price).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than 2 seats', async () => {
        const { user } = setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '1')

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeDisabled()

        const error = screen.getByText(
          /You cannot purchase a per user plan for less than 2 users/
        )
        expect(error).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than number of active users', async () => {
        const { user } = setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '9')

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeDisabled()

        const error = screen.getByText(
          /deactivate more users before downgrading plans/i
        )
        expect(error).toBeInTheDocument()
      })

      it('renders the update button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeInTheDocument()
      })

      describe('when updating to a monthly plan', () => {
        it('has the price for the month', async () => {
          const { user } = setup({ planValue: Plans.USERS_PR_INAPPY })
          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const monthlyOption = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(monthlyOption)

          const price = screen.getByText(/\$156/)
          expect(price).toBeInTheDocument()
        })
      })

      describe.skip('when the user has team plans available', () => {
        describe('when the feature flag is off', () => {
          it('does not renders the Pro and team buttons', () => {
            setup({
              planValue: Plans.USERS_PR_INAPPY,
              hasTeamPlans: true,
              multipleTiers: false,
            })
            render(<ProPlanControls {...props} />, { wrapper: wrapper() })

            const proBtn = screen.queryByRole('button', { name: 'Pro' })
            expect(proBtn).not.toBeInTheDocument()
            const teamBtn = screen.queryByRole('button', { name: 'Team' })
            expect(teamBtn).not.toBeInTheDocument()
          })
        })

        describe('when the feature flag is on', () => {
          it('renders the Pro button as "selected"', async () => {
            setup({
              planValue: Plans.USERS_PR_INAPPY,
              hasTeamPlans: true,
              multipleTiers: true,
            })
            render(<ProPlanControls {...props} />, { wrapper: wrapper() })

            const optionBtn = await screen.findByRole('button', { name: 'Pro' })
            expect(optionBtn).toBeInTheDocument()
            expect(optionBtn).toHaveClass('bg-ds-primary-base')
          })

          it('renders team option button', async () => {
            setup({
              planValue: Plans.USERS_PR_INAPPY,
              hasTeamPlans: true,
              multipleTiers: true,
            })
            render(<ProPlanControls {...props} />, { wrapper: wrapper() })

            const optionBtn = await screen.findByRole('button', {
              name: 'Team',
            })
            expect(optionBtn).toBeInTheDocument()
          })

          describe('when updating to a team plan', () => {
            it('renders up to 10 seats text', async () => {
              const { user } = setup({
                planValue: Plans.USERS_PR_INAPPY,
                hasTeamPlans: true,
                multipleTiers: true,
              })
              render(<ProPlanControls {...props} />, { wrapper: wrapper() })

              const teamOption = await screen.findByRole('button', {
                name: 'Team',
              })
              await user.click(teamOption)

              const auxiliaryText = await screen.findByText(/Up to 10 users/)
              expect(auxiliaryText).toBeInTheDocument()
            })

            it('displays per month price when annual with quantity 13', async () => {
              const { user } = setup({
                planValue: Plans.USERS_PR_INAPPY,
                hasTeamPlans: true,
                multipleTiers: true,
              })
              render(<ProPlanControls {...props} />, { wrapper: wrapper() })

              const teamOption = await screen.findByRole('button', {
                name: 'Team',
              })
              await user.click(teamOption)

              const perMonthPrice = screen.getByText(/\$52.00/)
              expect(perMonthPrice).toBeInTheDocument()
            })

            it('displays billed annually at price', async () => {
              const { user } = setup({
                planValue: Plans.USERS_PR_INAPPY,
                hasTeamPlans: true,
                multipleTiers: true,
              })
              render(<ProPlanControls {...props} />, { wrapper: wrapper() })

              const teamOption = await screen.findByRole('button', {
                name: 'Team',
              })
              await user.click(teamOption)

              const annualPrice = screen.getByText(
                /\/per month billed annually at \$624.00/
              )
              expect(annualPrice).toBeInTheDocument()
            })
          })
        })
      })

      describe('when the mutation is successful', () => {
        it('renders success notification when upgrading seats with an annual plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPY,
          })
          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 20,
                value: Plans.USERS_PR_INAPPY,
              },
            })
          )
        })

        it('renders success notification when upgrading seats with a monthly plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPY,
          })
          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const optionBtn = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(optionBtn)

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 20,
                value: Plans.USERS_PR_INAPPM,
              },
            })
          )
        })

        it('redirects the user to the plan page', async () => {
          const { user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPY,
          })
          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isFetching())

          expect(testLocation.pathname).toEqual('/plan/gh/codecov')
        })
      })

      describe('when the mutation is unsuccessful', () => {
        it('adds an error notification with detail message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            errorDetails: 'Insufficient funds.',
            planValue: Plans.USERS_PR_INAPPY,
          })

          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

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

        it('adds an error notification with a default message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            planValue: Plans.USERS_PR_INAPPY,
          })

          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

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

    describe('user is currently on a trial', () => {
      describe('user chooses less than the number of active users', () => {
        it('does not display an error', async () => {
          const { user } = setup({
            planValue: Plans.USERS_TRIAL,
            trialStatus: TrialStatuses.ONGOING,
          })
          render(<ProPlanControls {...props} />, { wrapper: wrapper() })

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

    describe('if there is an invoice', () => {
      it('renders the next billing period', async () => {
        setup({
          planValue: Plans.USERS_PR_INAPPM,
        })
        render(<ProPlanControls {...props} />, { wrapper: wrapper() })

        const nextBillingData = await screen.findByText(/Next Billing Date/)
        expect(nextBillingData).toBeInTheDocument()

        const billingDate = await screen.findByText(/August 20th, 2020/)
        expect(billingDate).toBeInTheDocument()
      })
    })
  })
})
