import { act, render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useMyContexts } from 'services/user'

import { useOnboardingTracking } from './useOnboardingTracking'
import UserOnboardingModal from './UserOnboardingModal'

import { useFlags } from '../../shared/featureFlags'

jest.mock('./useOnboardingTracking.js')
jest.mock('services/user', () => ({
  ...jest.requireActual('services/user'), // import and retain the original functionalities
  useMyContexts: jest.fn(),
}))
jest.mock('shared/featureFlags')

const orgsData = {
  currentUser: {
    username: 'codecov-user',
    avatarUrl: 'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
  },
  myOrganizations: [
    {
      username: 'codecov',
      avatarUrl: 'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
    },
  ],
}

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

const mockHistoryReplace = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    replace: mockHistoryReplace,
  }),
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const user = {
  username: 'TerrySmithDC',
  email: 'terry@terry.com',
  name: 'terry',
  avatarUrl: 'photo',
  onboardingCompleted: false,
}

describe('UserOnboardingModal', () => {
  const defaultCurrentUser = {
    email: 'user@gmail.com',
  }
  const completedUserOnboarding = jest.fn()
  const selectOrganization = jest.fn()
  const selectRepository = jest.fn()
  const skipOnboarding = jest.fn()
  function setup(currentUser = defaultCurrentUser, flagValue = true) {
    server.use(
      graphql.mutation('OnboardUser', (req, res, ctx) => {
        const newUser = {
          ...user,
          onboardingCompleted: true,
        }
        return res(
          ctx.status(200),
          ctx.data({
            onboardUser: {
              me: newUser,
            },
          })
        )
      })
    )

    useOnboardingTracking.mockReturnValue({
      startedOnboarding: jest.fn(),
      completedOnboarding: completedUserOnboarding,
      secondPage: jest.fn(),
      selectOrganization: selectOrganization,
      selectRepository: selectRepository,
      skipOnboarding: skipOnboarding,
    })

    useMyContexts.mockReturnValue({
      data: orgsData,
      refetch: jest.fn(),
    })
    useFlags.mockReturnValue({
      onboardingOrganizationSelector: flagValue,
    })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <UserOnboardingModal currentUser={currentUser} />
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  function getCheckbox(name) {
    return screen.getByRole('checkbox', { name })
  }

  async function clickNext() {
    screen
      .getByRole('button', {
        name: /next/i,
      })
      .click()
    // make sure the form updates properly
    return act(() => Promise.resolve())
  }

  function selectOrg() {
    const organization = screen.getByText('codecov')
    expect(organization).toBeInTheDocument()
    userEvent.click(organization)
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

  describe('when the user selects a goal and type of project', () => {
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

      it('renders organizations list', () => {
        expect(screen.getByText('codecov-user')).toBeInTheDocument()
        expect(screen.getByText('codecov')).toBeInTheDocument()
      })
    })

    describe('when the user selects an org', () => {
      beforeEach(async () => {
        await clickNext()
        await selectOrg()
      })

      it('calls selectOrganization', () => {
        expect(selectOrganization).toHaveBeenCalled()
      })
    })

    describe('when the user skips', () => {
      beforeEach(async () => {
        await clickNext()
        await selectOrg()
        screen.getByText(/skip/i).click()
      })

      it('calls skipOnboarding and does not redirect user', async () => {
        expect(skipOnboarding).toHaveBeenCalled()
        await waitFor(() => expect(mockHistoryReplace).not.toHaveBeenCalled())
      })
    })

    describe('when mutation is successful', () => {
      beforeEach(async () => {
        await clickNext()
        await selectOrg()
      })

      it('calls completedUserOnboarding and redirects user', async () => {
        const codecov = screen.getByText('codecov')
        userEvent.click(codecov)

        await waitFor(() => expect(completedUserOnboarding).toHaveBeenCalled())
        await waitFor(() =>
          expect(mockHistoryReplace).toHaveBeenCalledWith('/gh/codecov')
        )
      })
    })
  })
  describe('when the feature flag is false', () => {
    beforeEach(() => {
      setup(defaultCurrentUser, false)
    })

    describe('after submitting the form', () => {
      beforeEach(async () => {
        const educationalCheck = getCheckbox(/educational/i)
        userEvent.click(educationalCheck)

        const startingTests = getCheckbox(/just starting to write tests/i)
        userEvent.click(startingTests)

        await clickNext()
      })

      it('has the next button enabled', async () => {
        await waitFor(() => expect(completedUserOnboarding).toHaveBeenCalled())
        await waitFor(() => expect(mockHistoryReplace).not.toHaveBeenCalled())
      })
    })
  })
})
