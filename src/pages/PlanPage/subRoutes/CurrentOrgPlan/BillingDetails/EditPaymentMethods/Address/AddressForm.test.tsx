import { Elements } from '@stripe/react-stripe-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'
import { vi } from 'vitest'
import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account/useAccountDetails'

import AddressForm from './AddressForm'

const queryClient = new QueryClient()

const mockGetElement = vi.fn()
const mockGetValue = vi.fn()

vi.mock('@stripe/react-stripe-js', async () => {
  const actual = await vi.importActual('@stripe/react-stripe-js')
  return {
    ...actual,
    useElements: () => ({
      getElement: mockGetElement.mockReturnValue({
        getValue: mockGetValue.mockResolvedValue({
          complete: true,
          value: {
            name: 'John Doe',
            address: {
              line1: '123 Main St',
              line2: null,
              city: 'San Francisco',
              state: 'CA',
              postal_code: '94105',
              country: 'US',
            },
          },
        }),
      }),
    }),
  }
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Elements stripe={null}>
      <MemoryRouter initialEntries={['/plan/gh/codecov']}>
        <Route path="/plan/:provider/:owner">{children}</Route>
      </MemoryRouter>
    </Elements>
  </QueryClientProvider>
)

const mockSubscriptionDetail: z.infer<typeof SubscriptionDetailSchema> = {
  defaultPaymentMethod: {
    billingDetails: {
      address: {
        line1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
        line2: null,
      },
      phone: '1234567890',
      name: 'John Doe',
      email: 'test@example.com',
    },
    card: {
      brand: 'visa',
      expMonth: 12,
      expYear: 2025,
      last4: '4242',
    },
  },
  currentPeriodEnd: 1706851492,
  cancelAtPeriodEnd: false,
  customer: {
    id: 'cust_123',
    email: 'test@example.com',
  },
  latestInvoice: null,
  taxIds: [],
  trialEnd: null,
}

const mocks = {
  useUpdateBillingAddress: vi.fn(),
}

vi.mock('services/account/useUpdateBillingAddress', () => ({
  useUpdateBillingAddress: () => mocks.useUpdateBillingAddress(),
}))

afterEach(() => {
  vi.clearAllMocks()
})

describe('AddressForm', () => {
  const setup = () => {
    return { user: userEvent.setup() }
  }

  it('renders the form', () => {
    mocks.useUpdateBillingAddress.mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
    })

    render(
      <AddressForm
        address={
          mockSubscriptionDetail.defaultPaymentMethod?.billingDetails?.address
        }
        name={
          mockSubscriptionDetail.defaultPaymentMethod?.billingDetails?.name ||
          undefined
        }
        provider="gh"
        owner="codecov"
        closeForm={() => {}}
      />,
      { wrapper }
    )

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  describe('when submitting', () => {
    it('calls the service to update the address', async () => {
      const user = userEvent.setup()
      const updateAddress = vi.fn()
      mocks.useUpdateBillingAddress.mockReturnValue({
        mutate: updateAddress,
        isLoading: false,
      })

      render(
        <AddressForm
          address={
            mockSubscriptionDetail.defaultPaymentMethod?.billingDetails?.address
          }
          name={
            mockSubscriptionDetail.defaultPaymentMethod?.billingDetails?.name ||
            undefined
          }
          provider="gh"
          owner="codecov"
          closeForm={() => {}}
        />,
        { wrapper }
      )

      await user.click(screen.getByTestId('submit-address-update'))
      expect(updateAddress).toHaveBeenCalledWith(
        {
          name: 'John Doe',
          address: {
            line1: '123 Main St',
            line2: null,
            city: 'San Francisco',
            state: 'CA',
            postal_code: '94105',
            country: 'US',
          },
        },
        expect.any(Object)
      )
    })
  })

  describe('when the user clicks on cancel', () => {
    it('calls the closeForm prop', async () => {
      const { user } = setup()
      const closeForm = vi.fn()
      mocks.useUpdateBillingAddress.mockReturnValue({
        mutate: vi.fn(),
        isLoading: false,
      })

      render(
        <AddressForm
          address={
            mockSubscriptionDetail.defaultPaymentMethod?.billingDetails?.address
          }
          name={
            mockSubscriptionDetail.defaultPaymentMethod?.billingDetails?.name ||
            undefined
          }
          provider="gh"
          owner="codecov"
          closeForm={closeForm}
        />,
        { wrapper }
      )

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(closeForm).toHaveBeenCalled()
    })
  })

  describe('when the form is loading', () => {
    it('has the save and cancel buttons disabled', () => {
      mocks.useUpdateBillingAddress.mockReturnValue({
        mutate: vi.fn(),
        isLoading: true,
        error: null,
        reset: vi.fn(),
      })

      render(
        <AddressForm
          address={
            mockSubscriptionDetail.defaultPaymentMethod?.billingDetails?.address
          }
          name={
            mockSubscriptionDetail.defaultPaymentMethod?.billingDetails?.name ||
            undefined
          }
          provider="gh"
          owner="codecov"
          closeForm={() => {}}
        />,
        { wrapper }
      )

      expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })
  })
})
