import { render, screen, waitFor } from 'custom-testing-library'

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

let mockHistoryReplace = jest.fn()

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

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('UserOnboardingModal', () => {
  let currentUser
  const defaultCurrentUser = {
    email: 'user@gmail.com',
  }
  let completedUserOnboarding = jest.fn()
  let selectOrganization = jest.fn()
  let selectRepository = jest.fn()
  let skipOnboarding = jest.fn()

  beforeEach(() => {
    mockHistoryReplace = jest.fn()
    completedUserOnboarding = jest.fn()
    selectOrganization = jest.fn()
    selectRepository = jest.fn()
    skipOnboarding = jest.fn()
  })

  function setup(currentUserPassedIn = defaultCurrentUser, flagValue = true) {
    currentUser = currentUserPassedIn

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
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('has the form with the basic questions', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <UserOnboardingModal currentUser={currentUser} />
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      const bringsYouHereHeading = await screen.findByRole('heading', {
        name: /what type of projects brings you here\?/i,
      })
      expect(bringsYouHereHeading).toBeInTheDocument()

      const yourGoalHeading = await screen.findByRole('heading', {
        name: /What is your goal we can help with\?/i,
      })
      expect(yourGoalHeading).toBeInTheDocument()
    })

    it('has the next button disabled', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <UserOnboardingModal currentUser={currentUser} />
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      const button = await screen.findByRole('button', {
        name: /next/i,
      })
      expect(button).toBeInTheDocument()
      expect(button).toBeDisabled()
    })
  })

  describe('when the user selects a goal and type of project', () => {
    beforeEach(() => {
      setup()
    })

    it('has the next button enabled', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <UserOnboardingModal currentUser={currentUser} />
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      const educationalCheckbox = await screen.findByRole('checkbox', {
        name: /educational/i,
      })
      userEvent.click(educationalCheckbox)

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
      it('renders organizations list', async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/gh']}>
              <Route path="/:provider">
                <UserOnboardingModal currentUser={currentUser} />
              </Route>
            </MemoryRouter>
          </QueryClientProvider>
        )

        const educationalCheckbox = await screen.findByRole('checkbox', {
          name: /educational/i,
        })
        userEvent.click(educationalCheckbox)

        const justStartingCheckbox = await screen.findByRole('checkbox', {
          name: /just starting to write tests/i,
        })
        userEvent.click(justStartingCheckbox)

        const nextBtn = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn)

        const codecovUser = await screen.findByText('codecov-user')
        expect(codecovUser).toBeInTheDocument()

        const codecov = await screen.findByText('codecov')
        expect(codecov).toBeInTheDocument()
      })
    })

    describe('when the user selects an org', () => {
      it('calls selectOrganization', async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/gh']}>
              <Route path="/:provider">
                <UserOnboardingModal currentUser={currentUser} />
              </Route>
            </MemoryRouter>
          </QueryClientProvider>
        )

        const educationalCheckbox = await screen.findByRole('checkbox', {
          name: /educational/i,
        })
        userEvent.click(educationalCheckbox)

        const justStartingCheckbox = await screen.findByRole('checkbox', {
          name: /just starting to write tests/i,
        })
        userEvent.click(justStartingCheckbox)

        const nextBtn = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn)

        const codecov = await screen.findByText('codecov')
        userEvent.click(codecov)

        await waitFor(() => expect(selectOrganization).toHaveBeenCalled())
      })
    })

    describe('when the user skips', () => {
      it('calls skipOnboarding and does redirect user', async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/gh']}>
              <Route path="/:provider">
                <UserOnboardingModal currentUser={currentUser} />
              </Route>
            </MemoryRouter>
          </QueryClientProvider>
        )

        const educationalCheckbox = await screen.findByRole('checkbox', {
          name: /educational/i,
        })
        userEvent.click(educationalCheckbox)

        const justStartingCheckbox = await screen.findByRole('checkbox', {
          name: /just starting to write tests/i,
        })
        userEvent.click(justStartingCheckbox)

        const nextBtn = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn)

        const skipBtn = await screen.findByRole('button', { name: /skip/i })
        userEvent.click(skipBtn)

        await waitFor(() => expect(skipOnboarding).toHaveBeenCalled())
        await waitFor(() => expect(mockHistoryReplace).not.toHaveBeenCalled())
      })
    })

    describe('when mutation is successful', () => {
      it('calls completedUserOnboarding and redirects user', async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/gh']}>
              <Route path="/:provider">
                <UserOnboardingModal currentUser={currentUser} />
              </Route>
            </MemoryRouter>
          </QueryClientProvider>
        )

        const educationalCheckbox = await screen.findByRole('checkbox', {
          name: /educational/i,
        })
        userEvent.click(educationalCheckbox)

        const justStartingCheckbox = await screen.findByRole('checkbox', {
          name: /just starting to write tests/i,
        })
        userEvent.click(justStartingCheckbox)

        const nextBtn = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn)

        const codecov = await screen.findByText('codecov')
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
      it('has the next button enabled', async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/gh']}>
              <Route path="/:provider">
                <UserOnboardingModal currentUser={currentUser} />
              </Route>
            </MemoryRouter>
          </QueryClientProvider>
        )

        const educationalCheckbox = await screen.findByRole('checkbox', {
          name: /educational/i,
        })
        userEvent.click(educationalCheckbox)

        const justStartingCheckbox = await screen.findByRole('checkbox', {
          name: /just starting to write tests/i,
        })
        userEvent.click(justStartingCheckbox)

        const nextBtn = await screen.findByRole('button', {
          name: /next/i,
        })
        userEvent.click(nextBtn)

        await waitFor(() => expect(completedUserOnboarding).toHaveBeenCalled())
        await waitFor(() => expect(mockHistoryReplace).not.toHaveBeenCalled())
      })
    })
  })
})
