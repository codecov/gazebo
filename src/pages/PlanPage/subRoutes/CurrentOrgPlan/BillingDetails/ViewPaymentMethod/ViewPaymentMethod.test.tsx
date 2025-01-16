import { render, screen } from '@testing-library/react'
import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account'
import { accountDetailsParsedObj } from 'services/account/mocks'

import ViewPaymentMethod from './ViewPaymentMethod'

describe('ViewPaymentMethod', () => {
  const mockSetEditMode = vi.fn()
  const defaultProps = {
    heading: 'Payment Method',
    setEditMode: mockSetEditMode,
    subscriptionDetail: accountDetailsParsedObj.subscriptionDetail as z.infer<
      typeof SubscriptionDetailSchema
    >,
    provider: 'gh',
    owner: 'codecov',
  }

  beforeEach(() => {
    mockSetEditMode.mockClear()
  })

  describe('when rendered as primary payment method', () => {
    it('renders heading', () => {
      render(<ViewPaymentMethod {...defaultProps} isPrimaryPaymentMethod />)

      expect(screen.getByText('Payment Method')).toBeInTheDocument()
    })

    it('does not show secondary payment method message', () => {
      render(<ViewPaymentMethod {...defaultProps} isPrimaryPaymentMethod />)

      expect(
        screen.queryByText(
          'By default, if the primary payment fails, the secondary will be charged automatically.'
        )
      ).not.toBeInTheDocument()
    })

    it('does not show set as primary button', () => {
      render(<ViewPaymentMethod {...defaultProps} isPrimaryPaymentMethod />)

      expect(screen.queryByText('Set as primary')).not.toBeInTheDocument()
    })
  })

  describe('when payment method is credit card', () => {
    it('shows Cardholder name label', () => {
      render(<ViewPaymentMethod {...defaultProps} isPrimaryPaymentMethod />)

      expect(screen.getByText('Cardholder name')).toBeInTheDocument()
    })
  })

  describe('when payment method is bank account', () => {
    beforeEach(() => {
      defaultProps.subscriptionDetail = {
        ...accountDetailsParsedObj.subscriptionDetail,
        defaultPaymentMethod: {
          billingDetails:
            accountDetailsParsedObj.subscriptionDetail?.defaultPaymentMethod
              ?.billingDetails,
          usBankAccount: {
            bankName: 'Test Bank',
            last4: '1234',
          },
        },
      }
    })

    it('shows Full name label', () => {
      render(<ViewPaymentMethod {...defaultProps} isPrimaryPaymentMethod />)

      expect(screen.getByText('Full name')).toBeInTheDocument()
    })
  })
})
