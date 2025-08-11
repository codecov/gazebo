import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account/useAccountDetails'
import { ThemeContextProvider } from 'shared/ThemeContext'

import AddressCard from './AddressCard'

const mocks = vi.hoisted(() => ({
  useUpdateBillingAddress: vi.fn(),
}))

vi.mock('services/account/useUpdateBillingAddress', async () => {
  const actual = await import('services/account/useUpdateBillingAddress')
  return {
    ...actual,
    useUpdateBillingAddress: mocks.useUpdateBillingAddress,
  }
})

const subscriptionDetail = {
  defaultPaymentMethod: {
    card: {
      brand: 'visa',
      expMonth: 12,
      expYear: 2021,
      last4: '1234',
    },
    billingDetails: {
      name: 'Bob Smith',
      address: {
        line1: '123 Sesame St.',
        line2: 'Apt A',
        city: 'San Francisco',
        country: 'US',
        state: 'CA',
        postalCode: '12345',
      },
    },
  },
  currentPeriodEnd: 1606851492,
  cancelAtPeriodEnd: false,
} as z.infer<typeof SubscriptionDetailSchema>

const subscriptionDetailWithCustomer = {
  currentPeriodEnd: 1606851492,
  cancelAtPeriodEnd: false,
  defaultPaymentMethod: null,
  customer: {
    address: {
      line1: '456 Main St.',
      line2: null,
      city: 'San Francisco',
      country: 'US',
      state: 'CA',
      postalCode: '12345',
    },
    name: 'Bob Smith Jr.',
  },
} as z.infer<typeof SubscriptionDetailSchema>

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <ThemeContextProvider>{children}</ThemeContextProvider>
)

// mocking stripe components
vi.mock('@stripe/react-stripe-js', () => {
  function makeFakeComponent(name: string) {
    // mocking onReady to be called after a bit of time
    return function Component({ _onReady }: { _onReady?: any }) {
      return name
    }
  }

  return {
    useElements: () => ({
      getElement: vi.fn().mockReturnValue({
        getValue: vi.fn().mockResolvedValue({
          complete: true,
          value: {
            address: {},
          },
        }),
      }),
      update: vi.fn(),
    }),
    useStripe: () => ({}),
    AddressElement: makeFakeComponent('AddressElement'),
  }
})

describe('AddressCard', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe(`when the user doesn't have any subscriptionDetail`, () => {
    // NOTE: This test is misleading because we hide this component from a higher level in
    // BillingDetails.tsx if there is no subscriptionDetail
    it('renders the set card message', () => {
      render(
        <AddressCard subscriptionDetail={null} provider="gh" owner="codecov" />,
        { wrapper }
      )

      expect(
        screen.getByText(
          /No address has been set. Please contact support if you think it’s an error or set it yourself./
        )
      ).toBeInTheDocument()
    })
  })

  describe(`when the user doesn't have billing details or customer`, () => {
    it('renders an error message', () => {
      render(
        <AddressCard
          // @ts-expect-error weird param funkiness
          subscriptionDetail={{
            defaultPaymentMethod: null,
            customer: null,
          }}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(
        screen.getByText(
          /No address has been set. Please contact support if you think it’s an error or set it yourself./
        )
      ).toBeInTheDocument()
    })

    describe('when the user clicks on "Set Address"', () => {
      it(`doesn't render address info stuff anymore`, async () => {
        const { user } = setup()
        render(
          <AddressCard
            // @ts-expect-error weird param funkiness
            subscriptionDetail={{
              defaultPaymentMethod: null,
              customer: null,
            }}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        mocks.useUpdateBillingAddress.mockReturnValue({
          mutate: () => null,
          isLoading: false,
        })
        await user.click(screen.getByTestId('open-modal'))

        expect(
          screen.queryByText(/123 Sesame St. Apt A/)
        ).not.toBeInTheDocument()
      })

      it('renders the address form component', async () => {
        const { user } = setup()
        render(
          <AddressCard
            // @ts-expect-error weird param funkiness
            subscriptionDetail={{
              defaultPaymentMethod: null,
              customer: null,
            }}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        mocks.useUpdateBillingAddress.mockReturnValue({
          mutate: () => null,
          isLoading: false,
        })
        await user.click(screen.getByTestId('open-modal'))

        expect(
          screen.getByRole('button', { name: /update/i })
        ).toBeInTheDocument()
      })
    })
  })

  describe('when the user has an address', () => {
    it('renders the address information', () => {
      render(
        <AddressCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(screen.getByText(/Billing address/)).toBeInTheDocument()
      expect(screen.getByText(/123 Sesame St. Apt A/)).toBeInTheDocument()
      expect(screen.getByText(/San Francisco, CA 12345/)).toBeInTheDocument()
    })

    it('can render partial information too', () => {
      render(
        <AddressCard
          // @ts-expect-error weird param funkiness
          subscriptionDetail={{
            ...subscriptionDetail,
            defaultPaymentMethod: {
              card: {
                brand: 'visa',
                expMonth: 12,
                expYear: 2021,
                last4: '1234',
              },
              billingDetails: {
                name: null,
                email: null,
                phone: null,
                address: {
                  line1: null,
                  line2: null,
                  city: null,
                  country: null,
                  state: null,
                  postalCode: '12345',
                },
              },
            },
          }}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(screen.getByText('Full name')).toBeInTheDocument()
      expect(screen.getByText('N/A')).toBeInTheDocument()
      expect(screen.getByText('Billing address')).toBeInTheDocument()
      expect(screen.queryByText(/null/)).not.toBeInTheDocument()
      expect(screen.getByText('12345')).toBeInTheDocument()
    })

    it('can render information from the customer', () => {
      render(
        <AddressCard
          subscriptionDetail={subscriptionDetailWithCustomer}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(screen.getByText('Full name')).toBeInTheDocument()
      expect(screen.getByText('Bob Smith Jr.')).toBeInTheDocument()
      expect(screen.getByText('Billing address')).toBeInTheDocument()
      expect(screen.getByText('456 Main St.')).toBeInTheDocument()
      expect(screen.getByText('San Francisco, CA 12345')).toBeInTheDocument()
    })

    it('renders the card holder information', () => {
      render(
        <AddressCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(screen.getByText(/Full name/)).toBeInTheDocument()
      expect(screen.getByText(/Bob Smith/)).toBeInTheDocument()
    })
  })

  describe('when the user clicks on Edit', () => {
    it(`doesn't render the card anymore`, async () => {
      const { user } = setup()
      const updateAddress = vi.fn()
      mocks.useUpdateBillingAddress.mockReturnValue({
        mutate: updateAddress,
        isLoading: false,
      })

      render(
        <AddressCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )
      await user.click(screen.getByTestId('edit-address'))

      expect(screen.queryByText(/Cardholder name/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Bob Smith/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Billing address/)).not.toBeInTheDocument()
      expect(screen.queryByText(/123 Sesame St. Apt A/)).not.toBeInTheDocument()
      expect(
        screen.queryByText(/San Francisco, CA 12345/)
      ).not.toBeInTheDocument()
    })

    it('renders the form', async () => {
      const { user } = setup()
      const updateAddress = vi.fn()
      mocks.useUpdateBillingAddress.mockReturnValue({
        mutate: updateAddress,
        isLoading: false,
      })
      render(
        <AddressCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )
      await user.click(screen.getByTestId('edit-address'))

      expect(
        screen.getByRole('button', { name: /update/i })
      ).toBeInTheDocument()
    })

    describe('when submitting', () => {
      it('calls the service to update the address', async () => {
        const { user } = setup()
        const updateAddress = vi.fn()
        mocks.useUpdateBillingAddress.mockReturnValue({
          mutate: updateAddress,
          isLoading: false,
        })
        render(
          <AddressCard
            subscriptionDetail={subscriptionDetail}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )
        await user.click(screen.getByTestId('edit-address'))
        await user.click(screen.queryByRole('button', { name: /update/i })!)

        expect(updateAddress).toHaveBeenCalled()
      })
    })

    describe('when the user clicks on cancel', () => {
      it(`doesn't render the form anymore`, async () => {
        const { user } = setup()
        mocks.useUpdateBillingAddress.mockReturnValue({
          mutate: vi.fn(),
          isLoading: false,
        })
        render(
          <AddressCard
            subscriptionDetail={subscriptionDetail}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await user.click(screen.getByTestId('edit-address'))
        await user.click(screen.getByRole('button', { name: /Cancel/ }))

        expect(
          screen.queryByRole('button', { name: /save/i })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('when there is an error in the form', () => {
    it('renders the error when the error is an instance of Error', async () => {
      const { user } = setup()
      const randomError = 'not a valid address'
      mocks.useUpdateBillingAddress.mockReturnValue({
        mutate: vi.fn(),
        error: new Error(randomError),
      })
      render(
        <AddressCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      await user.click(screen.getByTestId('edit-address'))

      expect(
        screen.getByText((content, _element) => content.includes(randomError))
      ).toBeInTheDocument()
    })

    it('renders the error when the error is an instance of BillingApiError', async () => {
      const { user } = setup()
      const stripeError = 'Your card has expired'
      mocks.useUpdateBillingAddress.mockReturnValue({
        mutate: vi.fn(),
        error: {
          data: {
            detail: stripeError,
          },
        },
      })
      render(
        <AddressCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      await user.click(screen.getByTestId('edit-address'))

      expect(
        screen.getByText((content, _element) => content.includes(stripeError))
      ).toBeInTheDocument()
    })
  })

  describe('when the form is loading', () => {
    it('has the error and save button disabled', async () => {
      const { user } = setup()
      mocks.useUpdateBillingAddress.mockReturnValue({
        mutate: vi.fn(),
        isLoading: true,
      })
      render(
        <AddressCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )
      await user.click(screen.getByTestId('edit-address'))

      expect(screen.queryByRole('button', { name: /update/i })).toBeDisabled()
      expect(screen.queryByRole('button', { name: /cancel/i })).toBeDisabled()
    })
  })
})
