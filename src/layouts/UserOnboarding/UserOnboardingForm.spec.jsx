import { act, render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'

import { useOnboardUser } from 'services/user'

import { useOnboardingTracking } from './useOnboardingTracking'
import UserOnboardingForm from './UserOnboardingForm'

import { useFlags } from '../../shared/featureFlags'

jest.mock('services/user')
jest.mock('./useOnboardingTracking.js')
jest.mock('shared/featureFlags')

describe('UserOnboardingFrom', () => {
  const defaultCurrentUser = {
    email: 'user@gmail.com',
  }
  let mutate
  let completedUserOnboarding = jest.fn()
  let onFormSubmit = jest.fn()
  const secondPage = jest.fn()

  function setup(currentUser = defaultCurrentUser, flagValue = true) {
    mutate = jest.fn()
    useOnboardingTracking.mockReturnValue({
      startedOnboarding: jest.fn(),
      completedOnboarding: completedUserOnboarding,
      secondPage: secondPage,
    })
    useOnboardUser.mockReturnValue({
      isLoading: false,
      mutate,
      onSuccess: jest.fn(),
    })
    useFlags.mockReturnValue({
      onboardingOrganizationSelector: flagValue,
    })
    render(
      <UserOnboardingForm
        currentUser={currentUser}
        onFormSubmit={onFormSubmit}
      />
    )
  }

  function getCheckbox(name) {
    return screen.getByRole('checkbox', { name })
  }

  function clickNext() {
    screen
      .getByRole('button', {
        name: /next/i,
      })
      .click()
    // make sure the form updates properly
    return act(() => Promise.resolve())
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('has the form with the basic questions', () => {
      expect(
        screen.getByRole('heading', {
          name: /what type of projects brings you here\?/i,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', {
          name: /What is your goal we can help with\?/i,
        })
      ).toBeInTheDocument()
    })

    it('has the next button disabled', () => {
      const button = screen.getByRole('button', {
        name: /next/i,
      })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('when the user picks a type of projects', () => {
    beforeEach(() => {
      setup()
      getCheckbox(/educational/i).click()
    })

    it('selects the checkbox', () => {
      expect(getCheckbox(/educational/i)).toBeChecked()
    })

    it('still has the next button disabled', () => {
      const button = screen.getByRole('button', {
        name: /next/i,
      })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })

    describe('when the user clicks again', () => {
      beforeEach(() => {
        getCheckbox(/educational/i).click()
      })

      it('unselects the checkbox', () => {
        expect(getCheckbox(/educational/i)).not.toBeChecked()
      })
    })
  })

  describe('when the user picks a goal', () => {
    beforeEach(() => {
      setup()
      getCheckbox(/just starting to write tests/i).click()
    })

    it('selects the checkbox', () => {
      expect(getCheckbox(/just starting to write tests/i)).toBeChecked()
    })

    it('still has the next button disabled', () => {
      const button = screen.getByRole('button', {
        name: /next/i,
      })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('when the user selects a goal and type of projects', () => {
    beforeEach(() => {
      setup()
      getCheckbox(/educational/i).click()
      getCheckbox(/just starting to write tests/i).click()
    })

    it('has the next button enabled', () => {
      expect(
        screen.getByRole('button', {
          name: /next/i,
        })
      ).not.toBeDisabled()
    })

    describe('when the user clicks next', () => {
      beforeEach(() => {
        return clickNext()
      })

      it('calls onFormSubmit with the form information', () => {
        expect(onFormSubmit).toHaveBeenCalledWith({
          typeProjects: ['EDUCATIONAL'],
          businessEmail: '',
          email: defaultCurrentUser.email,
          goals: ['STARTING_WITH_TESTS'],
          otherGoal: '',
        })
      })
    })
  })

  describe('when the user doesnt have an email and fill the form', () => {
    beforeEach(() => {
      setup({
        email: '',
      })
      getCheckbox(/educational/i).click()
      getCheckbox(/just starting to write tests/i).click()
      return clickNext()
    })

    it('doesnt render the basic questions anymore', () => {
      expect(
        screen.queryByRole('heading', {
          name: /what type of projects brings you here\?/i,
        })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('heading', {
          name: /What is your goal we can help with\?/i,
        })
      ).not.toBeInTheDocument()
    })

    it('renders an input for the email', () => {
      expect(
        screen.getByRole('textbox', {
          name: /personal email/i,
        })
      ).toBeInTheDocument()
    })

    describe('when the user puts a wrong email and submits', () => {
      beforeEach(() => {
        userEvent.type(
          screen.getByRole('textbox', {
            name: /personal email/i,
          }),
          'blablabla'
        )
        screen
          .getByRole('button', {
            name: /next/i,
          })
          .click()
        // make sure the form updates properly
        return act(() => Promise.resolve())
      })

      it('puts an error message', () => {
        expect(screen.getByText(/not a valid email/i)).toBeInTheDocument()
      })
    })
  })

  describe('when the user picked "Your organization" type of project', () => {
    beforeEach(() => {
      setup()
      getCheckbox(/your organization/i).click()
      getCheckbox(/just starting to write tests/i).click()
      return clickNext()
    })

    it('calls secondPage function', () => {
      expect(secondPage).toHaveBeenCalled()
    })

    it('renders a field to enter business email', () => {
      expect(
        screen.getByRole('textbox', {
          name: /work email/i,
        })
      ).toBeInTheDocument()
    })

    describe('when the user submits a valid email', () => {
      beforeEach(() => {
        userEvent.type(
          screen.getByRole('textbox', {
            name: /work email/i,
          }),
          'rabee@codecov.io'
        )
        screen
          .getByRole('button', {
            name: /next/i,
          })
          .click()
        // make sure the form updates properly
        return act(() => Promise.resolve())
      })

      it('calls onFormSubmit with the correct form information', () => {
        expect(onFormSubmit).toHaveBeenCalledWith({
          typeProjects: ['YOUR_ORG'],
          businessEmail: 'rabee@codecov.io',
          email: defaultCurrentUser.email,
          goals: ['STARTING_WITH_TESTS'],
          otherGoal: '',
        })
      })
    })

    describe('when the user puts a wrong email and submits', () => {
      beforeEach(() => {
        userEvent.type(
          screen.getByRole('textbox', {
            name: /work email/i,
          }),
          'blablabla'
        )
        screen
          .getByRole('button', {
            name: /next/i,
          })
          .click()
        // make sure the form updates properly
        return act(() => Promise.resolve())
      })

      it('puts an error message', () => {
        expect(screen.getByText(/not a valid email/i)).toBeInTheDocument()
      })
    })

    describe('when users submit an invalid email', () => {
      beforeEach(() => {
        userEvent.type(
          screen.getByRole('textbox', {
            name: /work email/i,
          }),
          'abc@ama-trade.de'
        )
        screen
          .getByRole('button', {
            name: /next/i,
          })
          .click()
        // make sure the form updates properly
        return act(() => Promise.resolve())
      })

      it('puts an error message', () => {
        expect(screen.getByText(/not a valid email/i)).toBeInTheDocument()
      })
    })
  })

  describe('when the user types in the other field', () => {
    beforeEach(() => {
      setup()
      userEvent.type(
        screen.getByRole('textbox', {
          name: /other/i,
        }),
        'experimenting'
      )
    })

    it('selects the checkbox "Other"', () => {
      expect(getCheckbox(/other/i)).toBeChecked()
    })
  })

  describe('when feature flag is false', () => {
    beforeEach(() => {
      setup(defaultCurrentUser, false)
      getCheckbox(/your organization/i).click()
      getCheckbox(/just starting to write tests/i).click()
      return clickNext()
    })

    it('shows button with submit text', () => {
      expect(
        screen.getByRole('button', {
          name: /submit/i,
        })
      ).toBeInTheDocument()
    })
  })
})
