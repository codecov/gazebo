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
        disableInputs: false,
        isSentryUpgrade: false,
      }

      render(<UpdateButton {...props} />)

      const button = screen.getByText('Update')
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })
  })

  describe('disable inputs is set to true', () => {
    it('renders disabled button', () => {
      const props = {
        isValid: true,
        getValues: () => ({ newPlan: Plans.USERS_PR_INAPPY, seats: 10 }),
        value: Plans.USERS_BASIC,
        quantity: 2,
        disableInputs: true,
        isSentryUpgrade: false,
      }

      render(<UpdateButton {...props} />)

      const button = screen.getByText('Update')
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('there is no change in plan and seats', () => {
    it('renders disabled button', () => {
      const props = {
        isValid: true,
        getValues: () => ({ newPlan: Plans.USERS_PR_INAPPY, seats: 10 }),
        value: Plans.USERS_PR_INAPPY,
        quantity: 10,
        disableInputs: false,
        isSentryUpgrade: false,
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
        disableInputs: false,
        isSentryUpgrade: false,
      }

      render(<UpdateButton {...props} />)

      const button = screen.getByText('Update')
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('it is a sentry upgrade', () => {
    describe('the user has not yet started a trial', () => {
      describe('subscription details are present', () => {
        it('displays button with "Start trial" text', () => {
          const props = {
            isValid: true,
            getValues: () => ({ newPlan: Plans.USERS_PR_INAPPY, seats: 10 }),
            value: Plans.USERS_BASIC,
            quantity: 2,
            isSentryUpgrade: true,
            disableInputs: false,
            organizationName: 'codecov',
            accountDetails: {
              activatedUserCount: 0,
              subscriptionDetail: {
                trialEnd: null,
              },
            },
          }

          render(<UpdateButton {...props} />)

          const button = screen.getByText('Start trial')
          expect(button).toBeInTheDocument()
          expect(button).not.toBeDisabled()
        })

        it('displays no credit card required text', () => {
          const props = {
            isValid: true,
            getValues: () => ({ newPlan: Plans.USERS_PR_INAPPY, seats: 10 }),
            value: Plans.USERS_BASIC,
            quantity: 2,
            organizationName: 'codecov',
            disableInputs: false,
            isSentryUpgrade: true,
            accountDetails: {
              activatedUserCount: 0,
              subscriptionDetail: {
                trialEnd: null,
              },
            },
          }

          render(<UpdateButton {...props} />)

          const text = screen.getByText('No credit card required!')
          expect(text).toBeInTheDocument()
        })
      })

      describe('subscription details are not present', () => {
        it('displays button with "Start trial" text', () => {
          const props = {
            isValid: true,
            getValues: () => ({ newPlan: Plans.USERS_PR_INAPPY, seats: 10 }),
            value: Plans.USERS_BASIC,
            quantity: 2,
            isSentryUpgrade: true,
            disableInputs: false,
            organizationName: 'codecov',
            accountDetails: {
              activatedUserCount: 0,
              subscriptionDetail: null,
            },
          }

          render(<UpdateButton {...props} />)

          const button = screen.getByText('Start trial')
          expect(button).toBeInTheDocument()
          expect(button).not.toBeDisabled()
        })

        it('displays no credit card required text', () => {
          const props = {
            isValid: true,
            getValues: () => ({ newPlan: Plans.USERS_PR_INAPPY, seats: 10 }),
            value: Plans.USERS_BASIC,
            quantity: 2,
            organizationName: 'codecov',
            disableInputs: false,
            isSentryUpgrade: true,
            accountDetails: {
              activatedUserCount: 0,
              subscriptionDetail: null,
            },
          }

          render(<UpdateButton {...props} />)

          const text = screen.getByText('No credit card required!')
          expect(text).toBeInTheDocument()
        })
      })
    })

    describe('the user has already started the trial', () => {
      it('displays button with "Update" text', () => {
        const props = {
          isValid: true,
          getValues: () => ({ newPlan: Plans.USERS_PR_INAPPY, seats: 10 }),
          value: Plans.USERS_BASIC,
          quantity: 2,
          isSentryUpgrade: true,
          disableInputs: false,
          organizationName: 'codecov',
          accountDetails: {
            activatedUserCount: 0,
            subscriptionDetail: {
              trialEnd: 123456,
            },
          },
        }

        render(<UpdateButton {...props} />)

        const button = screen.getByText('Update')
        expect(button).toBeInTheDocument()
        expect(button).not.toBeDisabled()
      })
    })
  })
})
