import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'

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

const queryClient = new QueryClient({
  logger: {
    error: () => {},
  },
})
const server = setupServer()

let testLocation
const wrapper =
  (initialEntries = '/plan/gh') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/plan/:provider">{children}</Route>
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
  let addNotification
  let props

  const defaultProps = {
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

  function setup(
    selectedPlan = null,
    invoice = null,
    accountDetails = defaultProps.accountDetails,
    successfulRequest = true,
    errorDetails = undefined
  ) {
    addNotification = jest.fn()
    props = {
      ...defaultProps,
      accountDetails: {
        ...accountDetails,
        plan: selectedPlan,
        latestInvoice: invoice,
      },
    }
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
  }

  describe('when the user does not have any plan', () => {
    beforeEach(() => {
      setup()
    })

    it('renders monthly radio button', async () => {
      render(<UpgradeForm {...props} />, { wrapper: wrapper() })

      const radio = await screen.findByRole('radio', { name: /\$12/i })
      expect(radio).toBeInTheDocument()
      expect(radio).not.toBeDisabled()
    })

    it('renders annual radio button', async () => {
      render(<UpgradeForm {...props} />, { wrapper: wrapper() })

      const radio = await screen.findByRole('radio', { name: /\$10/i })
      expect(radio).toBeInTheDocument()
      expect(radio).not.toBeDisabled()
    })

    it('renders the seat input with 2 seats', async () => {
      render(<UpgradeForm {...props} />, { wrapper: wrapper() })

      const numberInput = await screen.findByRole('spinbutton')
      expect(numberInput).toBeInTheDocument()
      expect(numberInput).toHaveValue(2)
      expect(numberInput).not.toBeDisabled()
    })
  })

  describe('when no organization name or account details are not provided', () => {
    it('renders monthly radio button', async () => {
      render(
        <UpgradeForm proPlanMonth={proPlanMonth} proPlanYear={proPlanYear} />,
        { wrapper: wrapper() }
      )

      const radio = await screen.findByRole('radio', { name: /\$12/i })
      expect(radio).toBeInTheDocument()
      expect(radio).toBeDisabled()
    })

    it('renders annual radio button', async () => {
      render(
        <UpgradeForm proPlanMonth={proPlanMonth} proPlanYear={proPlanYear} />,
        { wrapper: wrapper() }
      )

      const radio = await screen.findByRole('radio', { name: /\$10/i })
      expect(radio).toBeInTheDocument()
      expect(radio).toBeDisabled()
    })

    it('renders the seat input with 2 seats', async () => {
      render(
        <UpgradeForm proPlanMonth={proPlanMonth} proPlanYear={proPlanYear} />,
        { wrapper: wrapper() }
      )

      const numberInput = await screen.findByRole('spinbutton')
      expect(numberInput).toBeInTheDocument()
      expect(numberInput).toHaveValue(2)
      expect(numberInput).toBeDisabled()
    })

    it('has the update button disabled', async () => {
      render(
        <UpgradeForm proPlanMonth={proPlanMonth} proPlanYear={proPlanYear} />,
        { wrapper: wrapper() }
      )

      const update = await screen.findByText(/Update/)
      expect(update).toBeDisabled()
    })
  })

  describe('when the user have a free plan', () => {
    beforeEach(() => {
      setup(basicPlan)
    })

    it('renders annual', async () => {
      render(<UpgradeForm {...props} />, { wrapper: wrapper() })

      const radio = await screen.findByRole('radio', { name: /\$10/ })
      expect(radio).toBeInTheDocument()
      expect(radio).toBeChecked()
    })

    it('renders the seat input with 2 seats', async () => {
      render(<UpgradeForm {...props} />, { wrapper: wrapper() })

      const numberInput = await screen.findByRole('spinbutton')
      expect(numberInput).toHaveValue(2)
    })
  })

  describe('when the user have a pro year plan', () => {
    beforeEach(() => {
      setup(proPlanYear)
    })

    it('renders annual radio to be checked', async () => {
      render(<UpgradeForm {...props} />, { wrapper: wrapper() })

      const radio = await screen.findByRole('radio', { name: /10/i })
      expect(radio).toBeChecked()
    })

    it('renders the seat input with 10 seats (existing subscription)', async () => {
      render(<UpgradeForm {...props} />, { wrapper: wrapper() })

      const seatCount = await screen.findByRole('spinbutton')
      expect(seatCount).toHaveValue(10)
    })

    it('has the price for the year', async () => {
      render(<UpgradeForm {...props} />, { wrapper: wrapper() })

      const price = await screen.findByText(/\$1,200/)
      expect(price).toBeInTheDocument()
    })

    it('has the update button disabled', async () => {
      render(<UpgradeForm {...props} />, { wrapper: wrapper() })

      const update = await screen.findByText(/Update/)
      expect(update).toBeDisabled()
    })

    describe('when updating to a month plan', () => {
      it('has the price for the month', async () => {
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const monthRadio = await screen.findByRole('radio', { name: /12/i })
        userEvent.click(monthRadio)

        const price = screen.getByText(/\$120/)
        expect(price).toBeInTheDocument()
      })
    })
  })

  describe('when the user have a pro year monthly', () => {
    beforeEach(() => {
      setup(proPlanMonth)
    })

    describe('user clicks select annual', () => {
      it('renders annual radio to be checked', async () => {
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const switchAnnual = await screen.findByText('switch to annual')
        userEvent.click(switchAnnual)

        const annualRadio = await screen.findByRole('radio', { name: /10/i })
        expect(annualRadio).toBeChecked()
      })
    })
  })

  describe('display student info', () => {
    describe('when there are no students', () => {
      beforeEach(() => {
        const accountDetails = {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: null,
          latestInvoice: null,
          activatedStudentCount: 0,
        }
        setup(basicPlan, null, accountDetails)
      })

      it('renders text for 1 student not taking active seats', async () => {
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

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
      beforeEach(() => {
        const accountDetails = {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: null,
          latestInvoice: null,
          activatedStudentCount: 1,
        }
        setup(basicPlan, null, accountDetails)
      })

      it('renders text for 1 student not taking active seats', async () => {
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const studentText = await screen.findByText(
          /\*You have 1 active student that does not count towards the number of active users./
        )
        expect(studentText).toBeInTheDocument()
      })
    })

    describe('when there are two or more students', () => {
      beforeEach(() => {
        const accountDetails = {
          activatedUserCount: 9,
          inactiveUserCount: 0,
          plan: null,
          latestInvoice: null,
          activatedStudentCount: 3,
        }
        setup(basicPlan, null, accountDetails)
      })

      it('renders text for two or more student not taking active seats', async () => {
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const studentText = await screen.findByText(
          /\*You have 3 active students that do not count towards the number of active users./
        )
        expect(studentText).toBeInTheDocument()
      })
    })
  })

  describe('if there is an invoice', () => {
    beforeEach(() => {
      const invoice = {
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
      }
      setup(proPlanMonth, invoice)
    })

    it('renders the next billing period', async () => {
      render(<UpgradeForm {...props} />, { wrapper: wrapper() })

      const nextBillingData = await screen.findByText(/Next Billing Date/)
      expect(nextBillingData).toBeInTheDocument()

      const billingDate = await screen.findByText(/August 20th, 2020/)
      expect(billingDate).toBeInTheDocument()
    })
  })

  describe('when the user leave the nb of seats blank', () => {
    beforeEach(() => {
      setup()
    })

    it('displays an error', async () => {
      render(<UpgradeForm {...props} />, { wrapper: wrapper() })

      const input = await screen.findByRole('spinbutton')
      userEvent.type(input, '{backspace}{backspace}{backspace}')

      const updateButton = await screen.findByRole('button', { name: 'Update' })
      userEvent.click(updateButton)

      const error = await screen.findByText(/Number of seats is required/)
      expect(error).toBeInTheDocument()
    })
  })

  describe('when the user chooses less than 2 seats', () => {
    beforeEach(() => {
      setup()
    })

    it('displays an error', async () => {
      render(<UpgradeForm {...props} />, { wrapper: wrapper() })

      const input = await screen.findByRole('spinbutton')
      userEvent.type(input, '{backspace}{backspace}{backspace}')
      userEvent.type(input, '1')

      const updateButton = await screen.findByRole('button', { name: 'Update' })
      userEvent.click(updateButton)

      const error = screen.getByText(
        /You cannot purchase a per user plan for less than 2 users/
      )
      expect(error).toBeInTheDocument()
    })
  })

  describe('when the user chooses less than the number of active users', () => {
    beforeEach(() => {
      setup()
    })

    it('displays an error', async () => {
      render(<UpgradeForm {...props} />, { wrapper: wrapper() })

      const input = await screen.findByRole('spinbutton')
      userEvent.type(input, '{backspace}{backspace}{backspace}')
      userEvent.type(input, '8')

      const updateButton = await screen.findByRole('button', { name: 'Update' })
      userEvent.click(updateButton)

      const error = await screen.findByText(
        /deactivate more users before downgrading plans/i
      )
      expect(error).toBeInTheDocument()
    })
  })

  describe('when clicking on the button to upgrade', () => {
    describe('when mutation is successful', () => {
      beforeEach(() => {
        setup()
      })

      it('adds a success notification', async () => {
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        userEvent.type(input, '{backspace}{backspace}{backspace}')
        userEvent.type(input, '20')

        const updateButton = await screen.findByRole('button', {
          name: 'Update',
        })
        userEvent.click(updateButton)

        await waitFor(() =>
          expect(addNotification).toHaveBeenCalledWith({
            type: 'success',
            text: 'Plan successfully upgraded',
          })
        )
      })

      it('redirects the user to the plan page', async () => {
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        userEvent.type(input, '{backspace}{backspace}{backspace}')
        userEvent.type(input, '20')

        const updateButton = await screen.findByRole('button', {
          name: 'Update',
        })
        userEvent.click(updateButton)

        await waitFor(() =>
          expect(testLocation.pathname).toEqual('/plan/gh/codecov')
        )
      })
    })

    describe('when mutation is not successful', () => {
      describe('an error message is provided', () => {
        beforeEach(() => {
          setup(
            null,
            null,
            defaultProps.accountDetails,
            false,
            'Insufficient funds.'
          )
        })

        it('adds an error notification with detail message', async () => {
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          userEvent.type(input, '{backspace}{backspace}{backspace}')
          userEvent.type(input, '20')

          const updateButton = await screen.findByRole('button', {
            name: 'Update',
          })
          userEvent.click(updateButton)

          await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
              type: 'error',
              text: 'Insufficient funds.',
            })
          )
        })
      })

      describe('no error message is provided', () => {
        beforeEach(() => {
          setup(null, null, defaultProps.accountDetails, false)
        })

        it('adds an error notification with a default message', async () => {
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          userEvent.type(input, '{backspace}{backspace}{backspace}')
          userEvent.type(input, '20')

          const updateButton = await screen.findByRole('button', {
            name: 'Update',
          })
          userEvent.click(updateButton)

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
