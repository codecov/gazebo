import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useImage } from 'services/image'
import { useMyContexts, useUser } from 'services/user'

import OrganizationSelector from './OrganizationSelector'

jest.spyOn(window.localStorage.__proto__, 'setItem')
window.localStorage.__proto__.setItem = jest.fn()

jest.mock('services/image')
jest.mock('services/user')
jest.mock('services/repos')

const contextData = {
  currentUser: {
    username: 'codecov-user',
    avatarUrl: 'https://avatars0.githubusercontent.com/u/99655254?v=3&s=55',
  },
  myOrganizations: [
    {
      username: 'codecov',
      avatarUrl: 'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
    },
  ],
}

const selectedOrg = {
  username: 'codecov',
  avatarUrl: 'https://avatars0.githubusercontent.com/u/8226205?v=3&s=55',
}

const loggedInUser = {
  username: 'Cerrit Agrupnin',
  trackingMetadata: {
    ownerid: 1638,
  },
}

describe('OrganizationSelector', () => {
  const onSelect = jest.fn()
  const onOnboardingSkip = jest.fn()
  const refetch = jest.fn()
  const currentUser = {
    email: 'user@gmail.com',
  }

  function setup() {
    useUser.mockReturnValue({ data: loggedInUser })
    useImage.mockReturnValue({ src: 'imageUrl', isLoading: false, error: null })
    useMyContexts.mockReturnValue({
      data: contextData,
      refetch: refetch,
    })
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders title', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationSelector
              onSelect={onSelect}
              onOnboardingSkip={onOnboardingSkip}
              currentUser={currentUser}
            />
          </Route>
        </MemoryRouter>
      )

      expect(container).toBeInTheDocument()

      const selectOrg = screen.getByText('Select organization')
      expect(selectOrg).toBeInTheDocument()
    })

    it('renders subtitle', () => {
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationSelector
              onSelect={onSelect}
              onOnboardingSkip={onOnboardingSkip}
              currentUser={currentUser}
            />
          </Route>
        </MemoryRouter>
      )

      const subTitle = screen.getByText(
        'This will help improve your experience'
      )
      expect(subTitle).toBeInTheDocument()
    })

    it('renders organizations list', () => {
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationSelector
              onSelect={onSelect}
              onOnboardingSkip={onOnboardingSkip}
              currentUser={currentUser}
            />
          </Route>
        </MemoryRouter>
      )

      const codecovUser = screen.getByText('codecov-user')
      expect(codecovUser).toBeInTheDocument()

      const codecov = screen.getByText('codecov')
      expect(codecov).toBeInTheDocument()
    })

    it('renders footer', () => {
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationSelector
              onSelect={onSelect}
              onOnboardingSkip={onOnboardingSkip}
              currentUser={currentUser}
            />
          </Route>
        </MemoryRouter>
      )

      const doNotSeeOrg = screen.getByText(/Don't see your org?/)
      expect(doNotSeeOrg).toBeInTheDocument()

      const helpFinding = screen.getByText(/Help finding org/i)
      expect(helpFinding).toBeInTheDocument()

      const skipBtn = screen.getByRole('button', { name: /skip/i })
      expect(skipBtn).toBeInTheDocument()
    })
  })

  describe('when user selects help finding org', () => {
    beforeEach(() => {
      setup()
    })

    it('renders help title', () => {
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationSelector
              onSelect={onSelect}
              onOnboardingSkip={onOnboardingSkip}
              currentUser={currentUser}
            />
          </Route>
        </MemoryRouter>
      )

      const helpFindOrgBtn = screen.getByText(/Help finding org/)
      userEvent.click(helpFindOrgBtn)

      const doNotSeeOrg = screen.getByText(/Don't see your organization?/)

      expect(doNotSeeOrg).toBeInTheDocument()
    })

    it('renders help subtitle', () => {
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationSelector
              onSelect={onSelect}
              onOnboardingSkip={onOnboardingSkip}
              currentUser={currentUser}
            />
          </Route>
        </MemoryRouter>
      )

      const helpFindOrgBtn = screen.getByText(/Help finding org/)
      userEvent.click(helpFindOrgBtn)

      const orgAccess = screen.getByText(
        /Your organization may need to grant access/
      )
      expect(orgAccess).toBeInTheDocument()

      const learnMoreLink = screen.queryByText('learn more')
      expect(learnMoreLink).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/github-oauth-application-authorization#troubleshooting'
      )
    })

    it('renders help body', () => {
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationSelector
              onSelect={onSelect}
              onOnboardingSkip={onOnboardingSkip}
              currentUser={currentUser}
            />
          </Route>
        </MemoryRouter>
      )

      const helpFindOrgBtn = screen.getByText(/Help finding org/)
      userEvent.click(helpFindOrgBtn)

      const orgAccess = screen.getByText(/Enable org access/)
      expect(orgAccess).toBeInTheDocument()
    })

    it('renders help footer buttons', () => {
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationSelector
              onSelect={onSelect}
              onOnboardingSkip={onOnboardingSkip}
              currentUser={currentUser}
            />
          </Route>
        </MemoryRouter>
      )

      const helpFindOrgBtn = screen.getByText(/Help finding org/)
      userEvent.click(helpFindOrgBtn)

      const backBtn = screen.getByRole('button', {
        name: /back/i,
      })
      expect(backBtn).toBeInTheDocument()

      const skipBtn = screen.getByRole('button', {
        name: /skip/i,
      })
      expect(skipBtn).toBeInTheDocument()
    })

    it('refresh list redirects user to org list after refetching', async () => {
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationSelector
              onSelect={onSelect}
              onOnboardingSkip={onOnboardingSkip}
              currentUser={currentUser}
            />
          </Route>
        </MemoryRouter>
      )

      const helpFindOrgBtn = screen.getByText(/Help finding org/)
      userEvent.click(helpFindOrgBtn)

      await act(() => {
        refetch.mockResolvedValue({ status: 'success' })
        return Promise.resolve()
      })

      const refreshList = screen.getByRole('button', {
        name: /refresh list/i,
      })
      userEvent.click(refreshList)

      const codecovUser = await screen.findByText('codecov-user')
      expect(codecovUser).toBeInTheDocument()

      const codecov = await screen.findByText('codecov')
      expect(codecov).toBeInTheDocument()
    })

    it('clicking back sets needs help false and renders org list', async () => {
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationSelector
              onSelect={onSelect}
              onOnboardingSkip={onOnboardingSkip}
              currentUser={currentUser}
            />
          </Route>
        </MemoryRouter>
      )

      const helpFindOrgBtn = screen.getByText(/Help finding org/)
      userEvent.click(helpFindOrgBtn)

      const backBtn = screen.getByRole('button', {
        name: /back/i,
      })
      userEvent.click(backBtn)

      const codecovUser = await screen.findByText('codecov-user')
      expect(codecovUser).toBeInTheDocument()

      const codecov = await screen.findByText('codecov')
      expect(codecov).toBeInTheDocument()
    })
  })

  describe('when user selects an organization', () => {
    beforeEach(() => {
      setup()
    })

    it('calls onSelect with org', () => {
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationSelector
              onSelect={onSelect}
              onOnboardingSkip={onOnboardingSkip}
              currentUser={currentUser}
            />
          </Route>
        </MemoryRouter>
      )

      const codecov = screen.getByText('codecov')
      userEvent.click(codecov)

      expect(onSelect).toHaveBeenCalledWith({ selectedOrg })
    })
  })

  describe('when user skips org selection', () => {
    beforeEach(() => {
      setup()
    })

    it('calls onOnboardingSkip', () => {
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationSelector
              onSelect={onSelect}
              onOnboardingSkip={onOnboardingSkip}
              currentUser={currentUser}
            />
          </Route>
        </MemoryRouter>
      )

      const skipBtn = screen.getByRole('button', {
        name: /skip/i,
      })
      userEvent.click(skipBtn)

      expect(onOnboardingSkip).toHaveBeenCalled()
    })
  })
})
