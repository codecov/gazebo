import { render, screen } from '@testing-library/react'

import UserOnboarding from './UserOnboarding'
import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

jest.mock('services/user')
jest.mock('shared/featureFlags')
jest.mock('./UserOnboardingModal', () => () => 'UserOnboardingModal')

describe('UserOnboarding', () => {
  const userOnboarded = {
    onboardingCompleted: true,
  }

  const userNotOnboarded = {
    onboardingCompleted: false,
  }

  function setup(currentUser, flagValue) {
    useUser.mockReturnValue({
      data: currentUser,
    })
    useFlags.mockReturnValue({
      userSignupOnboardingQuestions: flagValue,
    })
    render(<UserOnboarding />)
  }

  describe('when the user is not onboarded and the flag is true', () => {
    beforeEach(() => {
      setup(userNotOnboarded, true)
    })

    it('renders the onboarding modal', () => {
      expect(screen.getByText(/UserOnboardingModal/)).toBeInTheDocument()
    })
  })

  describe('when the user is onboarded and the flag is true', () => {
    beforeEach(() => {
      setup(userOnboarded, true)
    })

    it('doesnt render the onboarding modal', () => {
      expect(screen.queryByText(/UserOnboardingModal/)).not.toBeInTheDocument()
    })
  })

  describe('when the user is not authenticated and the flag is true', () => {
    beforeEach(() => {
      setup(null, true)
    })

    it('doesnt render the onboarding modal', () => {
      expect(screen.queryByText(/UserOnboardingModal/)).not.toBeInTheDocument()
    })
  })

  describe('when the user is not onboarded and the flag is false', () => {
    beforeEach(() => {
      setup(userNotOnboarded, false)
    })

    it('doesnt render the onboarding modal', () => {
      expect(screen.queryByText(/UserOnboardingModal/)).not.toBeInTheDocument()
    })
  })
})
