import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account'
import { ThemeContextProvider } from 'shared/ThemeContext'

import Address from './Address'

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
        <Address
          subscriptionDetail={null}
          provider="gh"
          owner="codecov"
          setEditMode={() => {}}
        />,
        { wrapper }
      )

      expect(
        screen.getByText(
          /No address has been set. Please contact support if you think it's an error or set it yourself./
        )
      ).toBeInTheDocument()
    })
  })

  describe(`when the user doesn't have billing details`, () => {
    it('renders an error message', () => {
      render(
        <Address
          // @ts-expect-error weird param funkiness
          subscriptionDetail={{
            ...subscriptionDetail,
            defaultPaymentMethod: null,
          }}
          provider="gh"
          owner="codecov"
          setEditMode={() => {}}
        />,
        { wrapper }
      )

      expect(
        screen.getByText(
          /No address has been set. Please contact support if you think it's an error or set it yourself./
        )
      ).toBeInTheDocument()
    })

    describe('when the user clicks on "Set Address"', () => {
      it(`doesn't render address info stuff anymore`, async () => {
        const { user } = setup()
        render(
          <Address
            // @ts-expect-error weird param funkiness
            subscriptionDetail={{
              ...subscriptionDetail,
              defaultPaymentMethod: null,
            }}
            provider="gh"
            owner="codecov"
            setEditMode={() => {}}
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
    })

    describe('when the user has an address', () => {
      it('renders the address information', () => {
        render(
          <Address
            subscriptionDetail={subscriptionDetail}
            provider="gh"
            owner="codecov"
            setEditMode={() => {}}
          />,
          { wrapper }
        )

        expect(screen.getByText(/Billing address/)).toBeInTheDocument()
        expect(screen.getByText(/123 Sesame St. Apt A/)).toBeInTheDocument()
        expect(screen.getByText(/San Francisco, CA 12345/)).toBeInTheDocument()
      })

      it('can render partial information too', () => {
        render(
          <Address
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
            setEditMode={() => {}}
          />,
          { wrapper }
        )

        expect(screen.getByText('Billing address')).toBeInTheDocument()
        expect(screen.queryByText(/null/)).not.toBeInTheDocument()
        expect(screen.getByText('12345')).toBeInTheDocument()
      })
    })
  })
})
