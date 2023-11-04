import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import { Plans } from 'shared/utils/billing'

import ProPlanControls from './ProPlanControls'

jest.mock('services/toastNotification')
jest.mock('@stripe/react-stripe-js')
jest.mock('./BillingControls', () => () => 'Billing Controls')
jest.mock('./TotalBanner', () => () => 'Total Banner')
jest.mock('./UserCount', () => () => 'User Count')

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

const allPlans = [
  basicPlan,
  proPlanMonth,
  proPlanYear,
  {
    marketingName: 'Pro Team',
    value: 'users-enterprisem',
    billingRate: 'monthly',
    baseUnitPrice: 12,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Pro Team',
    value: 'users-enterprisey',
    billingRate: 'annually',
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Sentry',
    value: 'users-sentrym',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: ['Includes 5 seats', 'Unlimited public repositories'],
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Sentry',
    value: 'users-sentryy',
    billingRate: null,
    baseUnitPrice: 10,
    benefits: ['Includes 5 seats', 'Unlimited private repositories'],
    monthlyUploadLimit: null,
  },
]

const mockAccountDetailsBasic = {
  plan: basicPlan,
  activatedUserCount: 1,
  inactiveUserCount: 0,
}

const mockAccountDetailsProMonthly = {
  plan: proPlanMonth,
  activatedUserCount: 7,
  inactiveUserCount: 0,
}

const mockAccountDetailsProYearly = {
  plan: proPlanYear,
  activatedUserCount: 11,
  inactiveUserCount: 0,
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
    } = {
      planValue: Plans.USERS_BASIC,
      successfulPatchRequest: true,
      errorDetails: undefined,
    }
  ) {
    const addNotification = jest.fn()
    const user = userEvent.setup()
    const patchRequest = jest.fn()

    useAddNotification.mockReturnValue(addNotification)

    server.use(
      rest.get(`/internal/gh/codecov/account-details/`, (req, res, ctx) => {
        if (planValue === Plans.USERS_BASIC) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsBasic))
        } else if (planValue === Plans.USERS_PR_INAPPM) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsProMonthly))
        } else if (planValue === Plans.USERS_PR_INAPPY) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsProYearly))
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
            owner: { availablePlans: allPlans },
          })
        )
      })
    )

    return { addNotification, user, patchRequest }
  }

  describe('when rendered', () => {
    describe('when the user has a basic plan', () => {
      it('renders organization title', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const organizationTitle = await screen.findByText(/Organization/)
        expect(organizationTitle).toBeInTheDocument()
      })

      it('renders the owner', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const ownerTitle = await screen.findByText(/codecov/)
        expect(ownerTitle).toBeInTheDocument()
      })

      it('renders the billing controls', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const billingControls = await screen.findByText(/Billing Controls/)
        expect(billingControls).toBeInTheDocument()
      })

      it('renders minimum seat number of 2 for basic plan', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const minimumSeat = await screen.findByRole('spinbutton')
        expect(minimumSeat).toHaveValue(2)
      })

      it('renders validation error when the user selects less than 2 seats', async () => {
        const { user } = setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls />, { wrapper: wrapper() })

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

      it('renders the user count component', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const userCount = await screen.findByText('User Count')
        expect(userCount).toBeInTheDocument()
      })

      it('renders the total banner component', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const totalBanner = await screen.findByText('Total Banner')
        expect(totalBanner).toBeInTheDocument()
      })

      it('renders the proceed to checkout for the update button', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const proceedToCheckoutButton = await screen.findByRole('button', {
          name: /Proceed to Checkout/,
        })
        expect(proceedToCheckoutButton).toBeInTheDocument()
      })

      describe('when the mutation is successful', () => {
        // This test works because users-pr-inappy is the default choice, but by me mocking the billingControls
        // I lose the ability to change that and test users-basic > monthly, only users-basic > yearly. Wdyt?
        it('renders success notification', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_BASIC,
          })
          render(<ProPlanControls />, { wrapper: wrapper() })

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
                value: 'users-pr-inappy',
              },
            })
          )
        })

        it('redirects the user to the plan page', async () => {
          const { user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_BASIC,
          })
          render(<ProPlanControls />, { wrapper: wrapper() })

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

          render(<ProPlanControls />, { wrapper: wrapper() })

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

          render(<ProPlanControls />, { wrapper: wrapper() })

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
      it('renders organization title', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const organizationTitle = await screen.findByText(/Organization/)
        expect(organizationTitle).toBeInTheDocument()
      })

      it('renders the owner', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const ownerTitle = await screen.findByText(/codecov/)
        expect(ownerTitle).toBeInTheDocument()
      })

      it('renders the billing controls', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const billingControls = await screen.findByText(/Billing Controls/)
        expect(billingControls).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than 2 seats', async () => {
        const { user } = setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls />, { wrapper: wrapper() })

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
        render(<ProPlanControls />, { wrapper: wrapper() })

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

      it('renders the user count component', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const userCount = await screen.findByText('User Count')
        expect(userCount).toBeInTheDocument()
      })

      it('renders the total banner component', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const totalBanner = await screen.findByText('Total Banner')
        expect(totalBanner).toBeInTheDocument()
      })

      it('renders the update button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeInTheDocument()
      })

      describe('when the mutation is successful', () => {
        // This test works because users-pr-inappm is the current, but by me mocking the billingControls
        // I lose the ability to change that and test users-monthly > yearly. Wdyt?
        it('renders success notification', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPM,
          })
          render(<ProPlanControls />, { wrapper: wrapper() })

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
                value: 'users-pr-inappm',
              },
            })
          )
        })

        it('redirects the user to the plan page', async () => {
          const { user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPM,
          })
          render(<ProPlanControls />, { wrapper: wrapper() })

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
            planValue: Plans.USERS_PR_INAPPM,
          })

          render(<ProPlanControls />, { wrapper: wrapper() })

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

          render(<ProPlanControls />, { wrapper: wrapper() })

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
      it('renders organization title', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const organizationTitle = await screen.findByText(/Organization/)
        expect(organizationTitle).toBeInTheDocument()
      })

      it('renders the owner', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const ownerTitle = await screen.findByText(/codecov/)
        expect(ownerTitle).toBeInTheDocument()
      })

      it('renders the billing controls', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const billingControls = await screen.findByText(/Billing Controls/)
        expect(billingControls).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than 2 seats', async () => {
        const { user } = setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls />, { wrapper: wrapper() })

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
        render(<ProPlanControls />, { wrapper: wrapper() })

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

      it('renders the user count component', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const userCount = await screen.findByText('User Count')
        expect(userCount).toBeInTheDocument()
      })

      it('renders the total banner component', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const totalBanner = await screen.findByText('Total Banner')
        expect(totalBanner).toBeInTheDocument()
      })

      it('renders the update button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY })
        render(<ProPlanControls />, { wrapper: wrapper() })

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeInTheDocument()
      })

      describe('when the mutation is successful', () => {
        // This test works because users-pr-inapym is the current, but by me mocking the billingControls
        // I lose the ability to change that and test users-yearly > monthly. Wdyt?
        it('renders success notification', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPY,
          })
          render(<ProPlanControls />, { wrapper: wrapper() })

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
                value: 'users-pr-inappy',
              },
            })
          )
        })

        it('redirects the user to the plan page', async () => {
          const { user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPY,
          })
          render(<ProPlanControls />, { wrapper: wrapper() })

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

          render(<ProPlanControls />, { wrapper: wrapper() })

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

          render(<ProPlanControls />, { wrapper: wrapper() })

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
  })
})
