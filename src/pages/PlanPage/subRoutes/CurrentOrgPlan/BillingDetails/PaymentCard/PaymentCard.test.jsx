import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter } from 'react-router-dom'

import { TrialStatuses } from 'services/account/usePlanData'
import { ThemeContextProvider } from 'shared/ThemeContext'
import { BillingRate, Plans } from 'shared/utils/billing'

import PaymentCard from './PaymentCard'

const queryClient = new QueryClient()

const mockedAccountDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 9,
    value: Plans.USERS_DEVELOPER,
  },
  activatedUserCount: 5,
  inactiveUserCount: 1,
}

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Developer',
  monthlyUploadLimit: 250,
  value: Plans.USERS_DEVELOPER,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 4,
  freeSeatCount: 1,
  hasSeatsLeft: true,
  isEnterprisePlan: false,
  isFreePlan: false,
  isProPlan: false,
  isSentryPlan: false,
  isTeamPlan: false,
  isTrialPlan: false,
}

const server = setupServer()

const mocks = vi.hoisted(() => ({
  useUpdatePaymentMethod: vi.fn(),
  useCreateStripeSetupIntent: vi.fn(),
}))

vi.mock('services/account/useUpdatePaymentMethod', async () => {
  const actual = await vi.importActual(
    'services/account/useUpdatePaymentMethod'
  )
  return {
    ...actual,
    useUpdatePaymentMethod: mocks.useUpdatePaymentMethod,
  }
})

vi.mock('services/account/useCreateStripeSetupIntent', async () => {
  const actual = await vi.importActual(
    'services/account/useCreateStripeSetupIntent'
  )
  return {
    ...actual,
    useCreateStripeSetupIntent: mocks.useCreateStripeSetupIntent,
  }
})

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
})

const subscriptionDetail = {
  defaultPaymentMethod: {
    card: {
      brand: 'visa',
      expMonth: 12,
      expYear: 2021,
      last4: '1234',
    },
  },
  plan: {
    value: Plans.USERS_PR_INAPPY,
  },
  currentPeriodEnd: 1606851492,
  cancelAtPeriodEnd: false,
}

const accountDetails = {
  subscriptionDetail,
  activatedUserCount: 1,
}

const usBankSubscriptionDetail = {
  defaultPaymentMethod: {
    usBankAccount: {
      bankName: 'STRIPE TEST BANK',
      last4: '6789',
    },
  },
  plan: {
    value: Plans.USERS_PR_INAPPY,
  },
  currentPeriodEnd: 1606851492,
  cancelAtPeriodEnd: false,
}

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      <ThemeContextProvider>{children}</ThemeContextProvider>
    </MemoryRouter>
  </QueryClientProvider>
)

// mocking all the stripe components; and trusting the library :)
vi.mock('@stripe/react-stripe-js', () => {
  function makeFakeComponent(name) {
    return function Component() {
      return name
    }
  }
  return {
    useElements: () => ({
      getElement: vi.fn(),
      submit: vi.fn(),
    }),
    useStripe: () => ({}),
    PaymentElement: makeFakeComponent('PaymentElement'),
    Elements: makeFakeComponent('Elements'),
  }
})

describe('PaymentCard', () => {
  function setup(
    trialStatus = TrialStatuses.NOT_STARTED,
    planValue = mockedAccountDetails.plan.value,
    isEnterprisePlan = false
  ) {
    const user = userEvent.setup()

    server.use(
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: true,
              plan: {
                ...mockPlanData,
                trialStatus,
                value: planValue,
                isEnterprisePlan,
              },
            },
          },
        })
      })
    )

    return { user }
  }

  describe(`when the user doesn't have any accountDetails`, () => {
    it('renders the set payment method message', () => {
      setup()
      render(
        <PaymentCard accountDetails={null} provider="gh" owner="codecov" />,
        { wrapper }
      )

      expect(
        screen.getByText(
          /No payment method set. Please contact support if you think it's an error or set it yourself./
        )
      ).toBeInTheDocument()
    })
  })

  describe(`when the user doesn't have any payment method`, () => {
    it('renders an error message', () => {
      setup()
      render(
        <PaymentCard
          accountDetails={{
            ...accountDetails,
            subscriptionDetail: {
              ...accountDetails.subscriptionDetail,
              defaultPaymentMethod: null,
            },
          }}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(
        screen.getByText(
          /No payment method set. Please contact support if you think it's an error or set it yourself./
        )
      ).toBeInTheDocument()
    })

    describe('when the user clicks on Set card', () => {
      it(`doesn't render the card anymore`, async () => {
        const { user } = setup()
        render(
          <PaymentCard
            accountDetails={{
              ...accountDetails,
              subscriptionDetail: {
                ...accountDetails.subscriptionDetail,
                defaultPaymentMethod: null,
              },
            }}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        mocks.useUpdatePaymentMethod.mockReturnValue({
          mutate: () => null,
          isLoading: false,
        })
        await user.click(screen.getByTestId('open-modal'))

        expect(screen.queryByText(/Visa/)).not.toBeInTheDocument()
      })

      it('renders the form', async () => {
        const { user } = setup()
        render(
          <PaymentCard
            accountDetails={{
              ...accountDetails,
              subscriptionDetail: {
                ...accountDetails.subscriptionDetail,
                defaultPaymentMethod: null,
              },
            }}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        mocks.useUpdatePaymentMethod.mockReturnValue({
          mutate: () => null,
          isLoading: false,
        })
        await user.click(screen.getByTestId('open-modal'))

        expect(screen.getByTestId('save-payment-method')).toBeInTheDocument()
      })
    })
  })

  describe('when the user have a card', () => {
    it('renders the card', () => {
      setup()
      render(
        <PaymentCard
          accountDetails={accountDetails}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(screen.getByText(/•••• 1234/)).toBeInTheDocument()
      expect(screen.getByText(/Expires 12\/21/)).toBeInTheDocument()
    })

    it('renders the next billing', () => {
      setup()
      render(
        <PaymentCard
          accountDetails={accountDetails}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(screen.getByText(/December 1, 2020/)).toBeInTheDocument()
    })

    it('renders the next billing price', async () => {
      setup()
      render(
        <PaymentCard
          accountDetails={accountDetails}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      await waitFor(() => {
        expect(screen.getByText(/for \$30.00/)).toBeInTheDocument()
      })
    })
  })

  describe('when the user has a US bank account', () => {
    it('renders the bank account details', () => {
      setup()
      const testAccountDetails = {
        ...accountDetails,
        subscriptionDetail: {
          ...usBankSubscriptionDetail,
        },
      }
      render(
        <PaymentCard
          accountDetails={testAccountDetails}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(screen.getByText(/STRIPE TEST BANK/)).toBeInTheDocument()
      expect(screen.getByText(/•••• 6789/)).toBeInTheDocument()
    })
  })

  describe('when the subscription is set to expire', () => {
    it(`doesn't render the next billing`, () => {
      setup()
      render(
        <PaymentCard
          accountDetails={{
            ...accountDetails,
            subscriptionDetail: {
              ...accountDetails.subscriptionDetail,
              cancelAtPeriodEnd: true,
            },
          }}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(screen.queryByText(/1st December, 2020/)).not.toBeInTheDocument()
    })
  })

  describe('when the user clicks on Edit card', () => {
    it(`doesn't render the card anymore`, async () => {
      const { user } = setup()
      const updatePaymentMethod = vi.fn()
      mocks.useUpdatePaymentMethod.mockReturnValue({
        mutate: updatePaymentMethod,
        isLoading: false,
      })

      render(
        <PaymentCard
          accountDetails={accountDetails}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )
      await user.click(screen.getByTestId('edit-payment-method'))

      expect(screen.queryByText(/Visa/)).not.toBeInTheDocument()
    })

    it('renders the form', async () => {
      const { user } = setup()
      const updatePaymentMethod = vi.fn()
      mocks.useUpdatePaymentMethod.mockReturnValue({
        mutate: updatePaymentMethod,
        isLoading: false,
      })
      render(
        <PaymentCard
          accountDetails={accountDetails}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )
      await user.click(screen.getByTestId('edit-payment-method'))

      expect(screen.getByTestId('save-payment-method')).toBeInTheDocument()
    })

    describe('when submitting', () => {
      it('calls the service to update the card', async () => {
        const { user } = setup()
        const updatePaymentMethod = vi.fn()
        mocks.useUpdatePaymentMethod.mockReturnValue({
          mutate: updatePaymentMethod,
          isLoading: false,
        })
        mocks.useCreateStripeSetupIntent.mockReturnValue({
          data: { clientSecret: 'test-secret' },
        })

        render(
          <PaymentCard
            accountDetails={accountDetails}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )
        await user.click(screen.getByTestId('edit-payment-method'))
        await user.click(screen.getByTestId('save-payment-method'))

        expect(updatePaymentMethod).toHaveBeenCalled()
      })
    })

    describe('when the user clicks on cancel', () => {
      it(`doesn't render the form anymore`, async () => {
        const { user } = setup()
        mocks.useUpdatePaymentMethod.mockReturnValue({
          mutate: vi.fn(),
          isLoading: false,
        })
        render(
          <PaymentCard
            accountDetails={accountDetails}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await user.click(screen.getByTestId('edit-payment-method'))
        await user.click(screen.getByTestId('cancel-payment'))

        expect(
          screen.queryByTestId('update-payment-method')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('when there is an error in the form', () => {
    it('renders the error', async () => {
      const { user } = setup()
      const randomError = 'not rich enough'
      mocks.useUpdatePaymentMethod.mockReturnValue({
        mutate: vi.fn(),
        error: { message: randomError },
      })
      render(
        <PaymentCard
          accountDetails={accountDetails}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      await user.click(screen.getByTestId('edit-payment-method'))

      expect(
        screen.getByText((content) =>
          content.includes(
            "There's been an error. Please try refreshing your browser"
          )
        )
      ).toBeInTheDocument()
    })
  })

  describe('when the form is loading', () => {
    it('has the error and save button disabled', async () => {
      const { user } = setup()
      mocks.useUpdatePaymentMethod.mockReturnValue({
        mutate: vi.fn(),
        isLoading: true,
      })
      render(
        <PaymentCard
          accountDetails={accountDetails}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )
      await user.click(screen.getByTestId('edit-payment-method'))

      expect(screen.getByTestId('save-payment-method')).toBeDisabled()
      expect(screen.getByTestId('cancel-payment')).toBeDisabled()
    })
  })
})
