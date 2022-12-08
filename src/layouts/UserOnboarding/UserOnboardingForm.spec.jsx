import { render, screen, waitFor } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'

import { useOnboardUser } from 'services/user'

import { useOnboardingTracking } from './useOnboardingTracking'
import UserOnboardingForm from './UserOnboardingForm'

jest.mock('services/user')
jest.mock('./useOnboardingTracking.js')
jest.mock('shared/featureFlags')

describe('UserOnboardingFrom', () => {
  let currentUser
  const defaultCurrentUser = {
    email: 'user@gmail.com',
  }
  let mutate
  let completedUserOnboarding
  let onFormSubmit
  let secondPage

  beforeEach(() => {
    completedUserOnboarding = jest.fn()
    onFormSubmit = jest.fn()
    secondPage = jest.fn()
  })

  function setup(currentUserPassedIn = defaultCurrentUser) {
    currentUser = currentUserPassedIn
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
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('has the form with the basic questions', async () => {
      render(
        <UserOnboardingForm
          currentUser={currentUser}
          onFormSubmit={onFormSubmit}
        />
      )

      const bringsYouHereHeading = await screen.findByRole('heading', {
        name: /what type of projects brings you here\?/i,
      })
      expect(bringsYouHereHeading).toBeInTheDocument()

      const helpWithHeading = await screen.findByRole('heading', {
        name: /What is your goal we can help with\?/i,
      })
      expect(helpWithHeading).toBeInTheDocument()
    })

    it('has the next button disabled', () => {
      render(
        <UserOnboardingForm
          currentUser={currentUser}
          onFormSubmit={onFormSubmit}
        />
      )

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
    })

    it('selects the checkbox', async () => {
      render(
        <UserOnboardingForm
          currentUser={currentUser}
          onFormSubmit={onFormSubmit}
        />
      )

      const checkbox = await screen.findByRole('checkbox', {
        name: /educational/i,
      })
      userEvent.click(checkbox)

      expect(checkbox).toBeChecked()
    })

    it('still has the next button disabled', async () => {
      render(
        <UserOnboardingForm
          currentUser={currentUser}
          onFormSubmit={onFormSubmit}
        />
      )

      const checkbox = await screen.findByRole('checkbox', {
        name: /educational/i,
      })
      userEvent.click(checkbox)

      const button = await screen.findByRole('button', {
        name: /next/i,
      })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })

    describe('when the user clicks again', () => {
      it('unselects the checkbox', async () => {
        render(
          <UserOnboardingForm
            currentUser={currentUser}
            onFormSubmit={onFormSubmit}
          />
        )

        const checkbox = await screen.findByRole('checkbox', {
          name: /educational/i,
        })
        userEvent.click(checkbox)
        userEvent.click(checkbox)

        expect(checkbox).not.toBeChecked()
      })
    })
  })

  describe('when the user picks a goal', () => {
    beforeEach(() => {
      setup()
    })

    it('selects the checkbox', async () => {
      render(
        <UserOnboardingForm
          currentUser={currentUser}
          onFormSubmit={onFormSubmit}
        />
      )

      const justStartingCheckbox = await screen.findByRole('checkbox', {
        name: /just starting to write tests/i,
      })
      userEvent.click(justStartingCheckbox)

      expect(justStartingCheckbox).toBeChecked()
    })

    it('still has the next button disabled', async () => {
      render(
        <UserOnboardingForm
          currentUser={currentUser}
          onFormSubmit={onFormSubmit}
        />
      )

      const justStartingCheckbox = await screen.findByRole('checkbox', {
        name: /just starting to write tests/i,
      })
      userEvent.click(justStartingCheckbox)

      const button = await screen.findByRole('button', {
        name: /next/i,
      })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('when the user selects a goal and type of projects', () => {
    beforeEach(() => {
      setup()
    })

    it('has the next button enabled', async () => {
      render(
        <UserOnboardingForm
          currentUser={currentUser}
          onFormSubmit={onFormSubmit}
        />
      )

      const checkbox = await screen.findByRole('checkbox', {
        name: /educational/i,
      })
      userEvent.click(checkbox)

      const justStartingCheckbox = await screen.findByRole('checkbox', {
        name: /just starting to write tests/i,
      })
      userEvent.click(justStartingCheckbox)

      const nextBtn = await screen.findByRole('button', {
        name: /next/i,
      })
      expect(nextBtn).not.toBeDisabled()
    })

    describe('when the user clicks next', () => {
      it('calls onFormSubmit with the form information', async () => {
        render(
          <UserOnboardingForm
            currentUser={currentUser}
            onFormSubmit={onFormSubmit}
          />
        )

        const checkbox = await screen.findByRole('checkbox', {
          name: /educational/i,
        })
        userEvent.click(checkbox)

        const justStartingCheckbox = await screen.findByRole('checkbox', {
          name: /just starting to write tests/i,
        })
        userEvent.click(justStartingCheckbox)

        const nextBtn = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn)

        await waitFor(() =>
          expect(onFormSubmit).toHaveBeenCalledWith({
            typeProjects: ['EDUCATIONAL'],
            businessEmail: '',
            email: defaultCurrentUser.email,
            goals: ['STARTING_WITH_TESTS'],
            otherGoal: '',
          })
        )
      })
    })
  })

  describe('when the user does not have an email and fill the form', () => {
    beforeEach(() => {
      setup({
        email: '',
      })
    })

    it('does not render the basic questions anymore', async () => {
      render(
        <UserOnboardingForm
          currentUser={currentUser}
          onFormSubmit={onFormSubmit}
        />
      )

      const checkbox = await screen.findByRole('checkbox', {
        name: /educational/i,
      })
      userEvent.click(checkbox)

      const justStartingCheckbox = await screen.findByRole('checkbox', {
        name: /just starting to write tests/i,
      })
      userEvent.click(justStartingCheckbox)

      const nextBtn = await screen.findByRole('button', {
        name: /next/i,
      })
      userEvent.click(nextBtn)

      const youHereHeading = screen.queryByRole('heading', {
        name: /what type of projects brings you here\?/i,
      })
      await waitFor(() => expect(youHereHeading).not.toBeInTheDocument())

      const helpHeading = screen.queryByRole('heading', {
        name: /What is your goal we can help with\?/i,
      })
      await waitFor(() => expect(helpHeading).not.toBeInTheDocument())
    })

    it('renders an input for the email', async () => {
      render(
        <UserOnboardingForm
          currentUser={currentUser}
          onFormSubmit={onFormSubmit}
        />
      )

      const checkbox = await screen.findByRole('checkbox', {
        name: /educational/i,
      })
      userEvent.click(checkbox)

      const justStartingCheckbox = await screen.findByRole('checkbox', {
        name: /just starting to write tests/i,
      })
      userEvent.click(justStartingCheckbox)

      const nextBtn = await screen.findByRole('button', {
        name: /next/i,
      })
      userEvent.click(nextBtn)

      const emailTxtBox = await screen.findByRole('textbox', {
        name: /personal email/i,
      })
      expect(emailTxtBox).toBeInTheDocument()
    })

    describe('when the user puts a wrong email and submits', () => {
      it('puts an error message', async () => {
        render(
          <UserOnboardingForm
            currentUser={currentUser}
            onFormSubmit={onFormSubmit}
          />
        )

        const checkbox = await screen.findByRole('checkbox', {
          name: /educational/i,
        })
        userEvent.click(checkbox)

        const justStartingCheckbox = await screen.findByRole('checkbox', {
          name: /just starting to write tests/i,
        })
        userEvent.click(justStartingCheckbox)

        const nextBtn = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn)

        const emailTxtBox = await screen.findByRole('textbox', {
          name: /personal email/i,
        })

        userEvent.type(emailTxtBox, 'not an email')

        const nextBtn2 = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn2)

        const errMsg = await screen.findByText(/not a valid email/i)
        expect(errMsg).toBeInTheDocument()
      })
    })
  })

  describe('when the user picked "Your organization" type of project', () => {
    beforeEach(() => {
      setup()
    })

    it('calls secondPage function', async () => {
      render(
        <UserOnboardingForm
          currentUser={currentUser}
          onFormSubmit={onFormSubmit}
        />
      )

      const checkbox = await screen.findByRole('checkbox', {
        name: /your organization/i,
      })
      userEvent.click(checkbox)

      const justStartingCheckbox = await screen.findByRole('checkbox', {
        name: /just starting to write tests/i,
      })
      userEvent.click(justStartingCheckbox)

      const nextBtn = await screen.findByRole('button', {
        name: /next/i,
      })
      userEvent.click(nextBtn)

      await waitFor(() => expect(secondPage).toHaveBeenCalled())
    })

    it('renders a field to enter business email', async () => {
      render(
        <UserOnboardingForm
          currentUser={currentUser}
          onFormSubmit={onFormSubmit}
        />
      )

      const checkbox = await screen.findByRole('checkbox', {
        name: /your organization/i,
      })
      userEvent.click(checkbox)

      const justStartingCheckbox = await screen.findByRole('checkbox', {
        name: /just starting to write tests/i,
      })
      userEvent.click(justStartingCheckbox)

      const nextBtn = await screen.findByRole('button', {
        name: /next/i,
      })
      userEvent.click(nextBtn)

      const emailTxtBox = await screen.findByRole('textbox', {
        name: /work email/i,
      })
      expect(emailTxtBox).toBeInTheDocument()
    })

    describe('when the user submits a valid email', () => {
      it('calls onFormSubmit with the correct form information', async () => {
        render(
          <UserOnboardingForm
            currentUser={currentUser}
            onFormSubmit={onFormSubmit}
          />
        )

        const checkbox = await screen.findByRole('checkbox', {
          name: /your organization/i,
        })
        userEvent.click(checkbox)

        const justStartingCheckbox = await screen.findByRole('checkbox', {
          name: /just starting to write tests/i,
        })
        userEvent.click(justStartingCheckbox)

        const nextBtn = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn)

        const emailTxtBox = await screen.findByRole('textbox', {
          name: /work email/i,
        })
        userEvent.type(emailTxtBox, 'codecov-user@codecov.io')

        const nextBtn2 = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn2)

        await waitFor(() =>
          expect(onFormSubmit).toHaveBeenCalledWith({
            typeProjects: ['YOUR_ORG'],
            businessEmail: 'codecov-user@codecov.io',
            email: defaultCurrentUser.email,
            goals: ['STARTING_WITH_TESTS'],
            otherGoal: '',
          })
        )
      })
    })

    describe('when the user puts a wrong email and submits', () => {
      it('puts an error message', async () => {
        render(
          <UserOnboardingForm
            currentUser={currentUser}
            onFormSubmit={onFormSubmit}
          />
        )

        const checkbox = await screen.findByRole('checkbox', {
          name: /your organization/i,
        })
        userEvent.click(checkbox)

        const justStartingCheckbox = await screen.findByRole('checkbox', {
          name: /just starting to write tests/i,
        })
        userEvent.click(justStartingCheckbox)

        const nextBtn = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn)

        const emailTxtBox = await screen.findByRole('textbox', {
          name: /work email/i,
        })
        userEvent.type(emailTxtBox, 'not an email')

        const nextBtn2 = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn2)

        const errMsg = await screen.findByText(/not a valid email/i)
        expect(errMsg).toBeInTheDocument()
      })
    })

    describe('when users submit an invalid email', () => {
      it('puts an error message', async () => {
        render(
          <UserOnboardingForm
            currentUser={currentUser}
            onFormSubmit={onFormSubmit}
          />
        )

        const checkbox = await screen.findByRole('checkbox', {
          name: /your organization/i,
        })
        userEvent.click(checkbox)

        const justStartingCheckbox = await screen.findByRole('checkbox', {
          name: /just starting to write tests/i,
        })
        userEvent.click(justStartingCheckbox)

        const nextBtn = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn)

        const emailTxtBox = await screen.findByRole('textbox', {
          name: /work email/i,
        })
        userEvent.type(emailTxtBox, 'abc@ama-trade.de')

        const nextBtn2 = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn2)

        const errMsg = await screen.findByText(/not a valid email/i)
        expect(errMsg).toBeInTheDocument()
      })
    })
  })

  describe('when the user types in the other field', () => {
    beforeEach(() => {
      setup()
    })

    it('selects the checkbox "Other"', async () => {
      render(
        <UserOnboardingForm
          currentUser={currentUser}
          onFormSubmit={onFormSubmit}
        />
      )

      const otherTxtBox = await screen.findByRole('textbox', {
        name: /other/i,
      })
      userEvent.type(otherTxtBox, 'experimenting')

      const otherCheckBox = await screen.findByRole('checkbox', {
        name: /other/i,
      })
      expect(otherCheckBox).toBeChecked()
    })
  })
})
