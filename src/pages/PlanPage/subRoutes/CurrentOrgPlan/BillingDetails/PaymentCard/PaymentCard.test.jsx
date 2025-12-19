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

const scheduledPhaseProYToTeamMAccountDetails = {
  subscriptionDetail,
  activatedUserCount: 1,
  scheduleDetail: {
    scheduledPhase: {
      plan: 'Team',
      baseUnitPrice: 6,
      billingRate: BillingRate.MONTHLY,
      quantity: 10,
      startDate: 1764258944,
    },
  },
}

const scheduledPhaseTeamYToProMAccountDetails = {
  subscriptionDetail: {
    defaultPaymentMethod: {
      card: {
        brand: 'visa',
        expMonth: 12,
        expYear: 2021,
        last4: '1234',
      },
    },
    plan: {
      value: Plans.USERS_TEAMY,
    },
    currentPeriodEnd: 1606851492,
    cancelAtPeriodEnd: false,
  },
  activatedUserCount: 1,
  scheduleDetail: {
    scheduledPhase: {
      plan: 'Pro',
      baseUnitPrice: 12,
      billingRate: BillingRate.MONTHLY,
      quantity: 7,
      startDate: 1764258944,
    },
  },
}

const scheduledPhaseTeamYToSentryProMAccountDetails = {
  subscriptionDetail: {
    defaultPaymentMethod: {
      card: {
        brand: 'visa',
        expMonth: 12,
        expYear: 2021,
        last4: '1234',
      },
    },
    plan: {
      value: Plans.USERS_TEAMY,
    },
    currentPeriodEnd: 1606851492,
    cancelAtPeriodEnd: false,
  },
  activatedUserCount: 1,
  scheduleDetail: {
    scheduledPhase: {
      plan: 'Sentry Pro',
      baseUnitPrice: 12,
      billingRate: BillingRate.MONTHLY,
      quantity: 9,
      startDate: 1764258944,
    },
  },
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
  function setup({
    trialStatus = TrialStatuses.NOT_STARTED,
    planValue = mockedAccountDetails.plan.value,
    isEnterprisePlan = false,
    isTeamPlan = true,
  }) {
    const user = userEvent.setup({})

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
                isTeamPlan,
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
      setup({})
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
      setup({})
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
        const { user } = setup({})
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
        const { user } = setup({})
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
      setup({})
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
      setup({})
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
      setup({})
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

    describe('Pro Plan pricing', () => {
      it('calculates Pro plan monthly billing correctly', async () => {
        // Pro plan: baseUnitPrice 12, 4 paid seats = $48.00
        server.use(
          graphql.query('GetPlanData', () => {
            return HttpResponse.json({
              data: {
                owner: {
                  hasPrivateRepos: true,
                  plan: {
                    ...mockPlanData,
                    billingRate: BillingRate.MONTHLY,
                    baseUnitPrice: 12,
                    planUserCount: 5,
                    freeSeatCount: 1,
                    isProPlan: true,
                    isTeamPlan: false,
                    isSentryPlan: false,
                  },
                },
              },
            })
          })
        )

        render(
          <PaymentCard
            accountDetails={accountDetails}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await waitFor(() => {
          expect(screen.getByText(/for \$48.00/)).toBeInTheDocument()
        })
      })

      it('calculates Pro plan annual billing correctly', async () => {
        // Pro plan: baseUnitPrice 10, 3 paid seats × 12 = $360.00
        server.use(
          graphql.query('GetPlanData', () => {
            return HttpResponse.json({
              data: {
                owner: {
                  hasPrivateRepos: true,
                  plan: {
                    ...mockPlanData,
                    billingRate: BillingRate.ANNUALLY,
                    baseUnitPrice: 10,
                    planUserCount: 4,
                    freeSeatCount: 1,
                    isProPlan: true,
                    isTeamPlan: false,
                    isSentryPlan: false,
                  },
                },
              },
            })
          })
        )

        render(
          <PaymentCard
            accountDetails={accountDetails}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await waitFor(() => {
          expect(screen.getByText(/for \$360.00/)).toBeInTheDocument()
        })
      })
    })

    describe('Team Plan pricing', () => {
      it('calculates Team plan monthly billing correctly', async () => {
        // Team plan: baseUnitPrice 6, 8 paid seats = $48.00
        server.use(
          graphql.query('GetPlanData', () => {
            return HttpResponse.json({
              data: {
                owner: {
                  hasPrivateRepos: true,
                  plan: {
                    ...mockPlanData,
                    billingRate: BillingRate.MONTHLY,
                    baseUnitPrice: 6,
                    planUserCount: 10,
                    freeSeatCount: 2,
                    isProPlan: false,
                    isTeamPlan: true,
                    isSentryPlan: false,
                  },
                },
              },
            })
          })
        )

        render(
          <PaymentCard
            accountDetails={accountDetails}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await waitFor(() => {
          expect(screen.getByText(/for \$48.00/)).toBeInTheDocument()
        })
      })

      it('calculates Team plan annual billing correctly', async () => {
        // Team plan: baseUnitPrice 5, 7 paid seats × 12 = $420.00
        server.use(
          graphql.query('GetPlanData', () => {
            return HttpResponse.json({
              data: {
                owner: {
                  hasPrivateRepos: true,
                  plan: {
                    ...mockPlanData,
                    billingRate: BillingRate.ANNUALLY,
                    baseUnitPrice: 5,
                    planUserCount: 9,
                    freeSeatCount: 2,
                    isProPlan: false,
                    isTeamPlan: true,
                    isSentryPlan: false,
                  },
                },
              },
            })
          })
        )

        render(
          <PaymentCard
            accountDetails={accountDetails}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await waitFor(() => {
          expect(screen.getByText(/for \$420.00/)).toBeInTheDocument()
        })
      })
    })

    describe('Sentry Plan pricing', () => {
      it('calculates Sentry plan monthly billing with 5 or fewer seats correctly', async () => {
        // Sentry plan: 5 seats = $29.00 (base price)
        server.use(
          graphql.query('GetPlanData', () => {
            return HttpResponse.json({
              data: {
                owner: {
                  hasPrivateRepos: true,
                  plan: {
                    ...mockPlanData,
                    billingRate: BillingRate.MONTHLY,
                    baseUnitPrice: 12,
                    planUserCount: 5,
                    freeSeatCount: 0,
                    isProPlan: false,
                    isTeamPlan: false,
                    isSentryPlan: true,
                  },
                },
              },
            })
          })
        )

        render(
          <PaymentCard
            accountDetails={accountDetails}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await waitFor(() => {
          expect(screen.getByText(/for \$29.00/)).toBeInTheDocument()
        })
      })

      it('calculates Sentry plan monthly billing with more than 5 seats correctly', async () => {
        // Sentry plan: 5 seats included + 3 additional seats × $12 = $29 + $36 = $65.00
        server.use(
          graphql.query('GetPlanData', () => {
            return HttpResponse.json({
              data: {
                owner: {
                  hasPrivateRepos: true,
                  plan: {
                    ...mockPlanData,
                    billingRate: BillingRate.MONTHLY,
                    baseUnitPrice: 12,
                    planUserCount: 8,
                    freeSeatCount: 0,
                    isProPlan: false,
                    isTeamPlan: false,
                    isSentryPlan: true,
                  },
                },
              },
            })
          })
        )

        render(
          <PaymentCard
            accountDetails={accountDetails}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await waitFor(() => {
          expect(screen.getByText(/for \$65.00/)).toBeInTheDocument()
        })
      })

      it('calculates Sentry plan annual billing with 5 or fewer seats correctly', async () => {
        // Sentry plan: 5 seats × 12 months = $29 × 12 = $348.00
        server.use(
          graphql.query('GetPlanData', () => {
            return HttpResponse.json({
              data: {
                owner: {
                  hasPrivateRepos: true,
                  plan: {
                    ...mockPlanData,
                    billingRate: BillingRate.ANNUALLY,
                    baseUnitPrice: 10,
                    planUserCount: 5,
                    freeSeatCount: 0,
                    isProPlan: false,
                    isTeamPlan: false,
                    isSentryPlan: true,
                  },
                },
              },
            })
          })
        )

        render(
          <PaymentCard
            accountDetails={accountDetails}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await waitFor(() => {
          expect(screen.getByText(/for \$348.00/)).toBeInTheDocument()
        })
      })

      it('calculates Sentry plan annual billing with more than 5 seats correctly', async () => {
        // Sentry plan: (5 seats included + 2 additional seats × $10) × 12 = ($29 + $20) × 12 = $588.00
        server.use(
          graphql.query('GetPlanData', () => {
            return HttpResponse.json({
              data: {
                owner: {
                  hasPrivateRepos: true,
                  plan: {
                    ...mockPlanData,
                    billingRate: BillingRate.ANNUALLY,
                    baseUnitPrice: 10,
                    planUserCount: 7,
                    freeSeatCount: 0,
                    isProPlan: false,
                    isTeamPlan: false,
                    isSentryPlan: true,
                  },
                },
              },
            })
          })
        )

        render(
          <PaymentCard
            accountDetails={accountDetails}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await waitFor(() => {
          expect(screen.getByText(/for \$588.00/)).toBeInTheDocument()
        })
      })
    })
    describe('Scheduled phase pricing', () => {
      it('calculates the next billing price correctly when switching from Pro to Team', async () => {
        // Upcoming team monthly plan: baseUnitPrice 6, 10 paid seats = $60.00
        setup({})
        render(
          <PaymentCard
            accountDetails={scheduledPhaseProYToTeamMAccountDetails}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await waitFor(() => {
          expect(screen.getByText(/for \$60.00/)).toBeInTheDocument()
        })
      })

      it('calculates the next billing price correctly when switching from Team to Pro', async () => {
        // Upcoming pro monthly plan: baseUnitPrice 12, 7 paid seats = $84.00
        setup({})
        render(
          <PaymentCard
            accountDetails={scheduledPhaseTeamYToProMAccountDetails}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await waitFor(() => {
          expect(screen.getByText(/for \$84.00/)).toBeInTheDocument()
        })
      })

      it('calculates the next billing price correctly when switching from Team to Sentry Pro', async () => {
        // Upcoming Sentry Pro monthly plan: baseUnitPrice 12, 9 paid seats = $29 + 4 seats x $12 = $77.00
        setup({})
        render(
          <PaymentCard
            accountDetails={scheduledPhaseTeamYToSentryProMAccountDetails}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await waitFor(() => {
          expect(screen.getByText(/for \$77.00/)).toBeInTheDocument()
        })
      })
    })
  })

  describe('when the user has a US bank account', () => {
    it('renders the bank account details', () => {
      setup({})
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
      setup({})
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
      const { user } = setup({})
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
      const { user } = setup({})
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
        const { user } = setup({})
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
        const { user } = setup({})
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
      const { user } = setup({})
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
      const { user } = setup({})
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
