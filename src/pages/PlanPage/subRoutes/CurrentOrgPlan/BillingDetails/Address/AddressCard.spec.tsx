import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account'
import { useUpdateBillingAddress } from 'services/account/useUpdateBillingAddress'

import AddressCard from './AddressCard'

jest.mock('services/account/useUpdateBillingAddress')

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

// mocking stripe components
jest.mock('@stripe/react-stripe-js', () => {
  function makeFakeComponent(name: string) {
    // mocking onReady to be called after a bit of time
    return function Component({ onReady }: { onReady?: any }) {
      return name
    }
  }
  return {
    useElements: () => ({
      getElement: jest.fn().mockReturnValue({
        getValue: jest.fn().mockResolvedValue({
          complete: true,
          value: {
            address: {},
          },
        }),
      }),
      update: jest.fn(),
    }),
    useStripe: () => ({}),
    AddressElement: makeFakeComponent('AddressElement'),
  }
})

const mockUseUpdateBillingAddress = useUpdateBillingAddress as jest.Mock

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
        <AddressCard subscriptionDetail={null} provider="gh" owner="codecov" />
      )

      expect(
        screen.getByText(
          /No address has been set. Please contact support if you think it’s an error or set it yourself./
        )
      ).toBeInTheDocument()
    })
  })

  describe(`when the user doesn't have billing details`, () => {
    it('renders an error message', () => {
      render(
        <AddressCard
          // @ts-expect-error weird param funkiness
          subscriptionDetail={{
            ...subscriptionDetail,
            defaultPaymentMethod: null,
          }}
          provider="gh"
          owner="codecov"
        />
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
              ...subscriptionDetail,
              defaultPaymentMethod: null,
            }}
            provider="gh"
            owner="codecov"
          />
        )

        mockUseUpdateBillingAddress.mockReturnValue({
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
              ...subscriptionDetail,
              defaultPaymentMethod: null,
            }}
            provider="gh"
            owner="codecov"
          />
        )

        mockUseUpdateBillingAddress.mockReturnValue({
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
        />
      )

      expect(screen.getByText(/Billing address/)).toBeInTheDocument()
      expect(screen.getByText(/123 Sesame St. Apt A/)).toBeInTheDocument()
      expect(screen.getByText(/San Francisco, CA 12345/)).toBeInTheDocument()
    })

    it('renders the card holder information', () => {
      render(
        <AddressCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />
      )

      expect(screen.getByText(/Cardholder name/)).toBeInTheDocument()
      expect(screen.getByText(/Bob Smith/)).toBeInTheDocument()
    })
  })

  describe('when the user clicks on Edit', () => {
    it(`doesn't render the card anymore`, async () => {
      const { user } = setup()
      const updateAddress = jest.fn()
      mockUseUpdateBillingAddress.mockReturnValue({
        mutate: updateAddress,
        isLoading: false,
      })

      render(
        <AddressCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />
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
      const updateAddress = jest.fn()
      mockUseUpdateBillingAddress.mockReturnValue({
        mutate: updateAddress,
        isLoading: false,
      })
      render(
        <AddressCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />
      )
      await user.click(screen.getByTestId('edit-address'))

      expect(
        screen.getByRole('button', { name: /update/i })
      ).toBeInTheDocument()
    })

    describe('when submitting', () => {
      it('calls the service to update the address', async () => {
        const { user } = setup()
        const updateAddress = jest.fn()
        mockUseUpdateBillingAddress.mockReturnValue({
          mutate: updateAddress,
          isLoading: false,
        })
        render(
          <AddressCard
            subscriptionDetail={subscriptionDetail}
            provider="gh"
            owner="codecov"
          />
        )
        await user.click(screen.getByTestId('edit-address'))
        await user.click(screen.queryByRole('button', { name: /update/i })!)

        expect(updateAddress).toHaveBeenCalled()
      })
    })

    describe('when the user clicks on cancel', () => {
      it(`doesn't render the form anymore`, async () => {
        const { user } = setup()
        mockUseUpdateBillingAddress.mockReturnValue({
          mutate: jest.fn(),
          isLoading: false,
        })
        render(
          <AddressCard
            subscriptionDetail={subscriptionDetail}
            provider="gh"
            owner="codecov"
          />
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
    it('renders the error', async () => {
      const { user } = setup()
      const randomError = 'not a valid address'
      mockUseUpdateBillingAddress.mockReturnValue({
        mutate: jest.fn(),
        error: randomError,
      })
      render(
        <AddressCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />
      )

      await user.click(screen.getByTestId('edit-address'))

      expect(screen.getByText(randomError)).toBeInTheDocument()
    })
  })

  describe('when the form is loading', () => {
    it('has the error and save button disabled', async () => {
      const { user } = setup()
      mockUseUpdateBillingAddress.mockReturnValue({
        mutate: jest.fn(),
        isLoading: true,
      })
      render(
        <AddressCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />
      )
      await user.click(screen.getByTestId('edit-address'))

      expect(screen.queryByRole('button', { name: /update/i })).toBeDisabled()
      expect(screen.queryByRole('button', { name: /cancel/i })).toBeDisabled()
    })
  })
})
