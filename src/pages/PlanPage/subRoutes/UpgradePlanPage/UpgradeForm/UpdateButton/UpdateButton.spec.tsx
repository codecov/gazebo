import { render, screen } from '@testing-library/react'

import { Plans } from 'shared/utils/billing'

import UpdateButton from './UpdateButton'

describe('UpdateButton', () => {
  describe('props align to not be disabled', () => {
    it('renders non-disabled button', () => {
      const props = {
        isValid: true,
        getValues: () => ({ newPlan: Plans.USERS_PR_INAPPY, seats: 10 }),
        value: Plans.USERS_BASIC,
        quantity: 2,
        isSentryUpgrade: false,
        trialStatus: 'NOT_STARTED',
      }

      render(<UpdateButton {...props} />)

      const button = screen.getByText('Proceed to Checkout')
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })
  })

  describe('there is no change in plan and seats', () => {
    it('renders disabled button', () => {
      const props = {
        isValid: true,
        getValues: () => ({ newPlan: Plans.USERS_PR_INAPPY, seats: 10 }),
        value: Plans.USERS_PR_INAPPY,
        quantity: 10,
        isSentryUpgrade: false,
        trialStatus: 'NOT_STARTED',
      }

      render(<UpdateButton {...props} />)

      const button = screen.getByText('Update')
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('isValid is set to false', () => {
    it('renders disabled button', () => {
      const props = {
        isValid: false,
        getValues: () => ({ newPlan: Plans.USERS_PR_INAPPY, seats: 10 }),
        value: Plans.USERS_BASIC,
        quantity: 2,
        isSentryUpgrade: false,
        trialStatus: 'NOT_STARTED',
      }

      render(<UpdateButton {...props} />)

      const button = screen.getByText('Proceed to Checkout')
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('user is able to start a new plan', () => {
    it('displays button with "Proceed to Checkout" text', () => {
      const props = {
        isValid: true,
        getValues: () => ({ newPlan: Plans.USERS_PR_INAPPY, seats: 10 }),
        value: Plans.USERS_BASIC,
        quantity: 2,
      }

      render(<UpdateButton {...props} />)

      const button = screen.getByText('Proceed to Checkout')
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })
  })
})
