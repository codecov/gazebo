import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useMyContexts } from 'services/user'

import OrganizationSelector from './OrganizationSelector'

import { useRepos } from '../../services/repos'

jest.spyOn(window.localStorage.__proto__, 'setItem')
window.localStorage.__proto__.setItem = jest.fn()

jest.mock('services/user')
jest.mock('services/repos')

const contextData = {
  currentUser: {
    username: 'Rabee-AbuBaker',
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

const selectedRepo = {
  name: 'opentelem-ruby',
  active: false,
  private: false,
  coverage: null,
  updatedAt: null,
  latestCommitAt: null,
  author: { username: 'codecov' },
}

const reposData = {
  repos: [
    {
      name: 'opentelem-ruby',
      active: false,
      private: false,
      coverage: null,
      updatedAt: null,
      latestCommitAt: null,
      author: { username: 'codecov' },
    },
    {
      name: 'impact-analysis',
      active: false,
      private: true,
      coverage: null,
      updatedAt: null,
      latestCommitAt: null,
      author: { username: 'codecov' },
    },
    {
      name: 'codecov-gateway',
      active: false,
      private: true,
      coverage: null,
      updatedAt: null,
      latestCommitAt: null,
      author: { username: 'codecov' },
    },
  ],
}

describe('OrganizationSelector', () => {
  let container
  const onSelect = jest.fn()
  const onOnboardingSkip = jest.fn()
  const refetch = jest.fn()
  const currentUser = {
    email: 'user@gmail.com',
  }
  function setup() {
    useMyContexts.mockReturnValue({
      data: contextData,
      refetch: refetch,
    })
    useRepos.mockReturnValue({
      data: reposData,
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isFetchingNextPage: false,
      isLoading: false,
    })(
      ({ container } = render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationSelector
              onSelect={onSelect}
              onOnboardingSkip={onOnboardingSkip}
              currentUser={currentUser}
            />
          </Route>
        </MemoryRouter>
      ))
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders title', () => {
      expect(container).toBeInTheDocument()
      expect(screen.getByText(/Select organization/)).toBeInTheDocument()
    })

    it('renders subtitle', () => {
      expect(
        screen.getByText(
          /To set up your first repo, tell us which organization it’s in/
        )
      ).toBeInTheDocument()
    })

    it('renders organizations list', () => {
      expect(screen.getByText('Rabee-AbuBaker')).toBeInTheDocument()
      expect(screen.getByText('codecov')).toBeInTheDocument()
    })

    it('renders footer', () => {
      expect(screen.getByText(/Don’t see your org?/)).toBeInTheDocument()
      expect(screen.getByText(/Help finding org/)).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: /skip/i,
        })
      ).toBeInTheDocument()
    })
  })

  describe('when user selects help finding org', () => {
    beforeEach(() => {
      setup()
      screen.getByText(/Help finding org/).click()
    })

    it('renders help title', () => {
      expect(
        screen.getByText(/Don’t see your organization?/)
      ).toBeInTheDocument()
    })

    it('renders help subtitle', () => {
      expect(
        screen.getByText(/Your organization may need to grant access/)
      ).toBeInTheDocument()

      expect(screen.queryByText('learn more')).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/github-oauth-application-authorization#troubleshooting'
      )
    })

    it('renders help body', () => {
      expect(screen.getByText(/Enable org access/)).toBeInTheDocument()
    })

    it('renders help footer buttons', () => {
      expect(
        screen.getByRole('button', {
          name: /back/i,
        })
      ).toBeInTheDocument()

      expect(
        screen.getByRole('button', {
          name: /skip/i,
        })
      ).toBeInTheDocument()
    })

    it('refresh list redirects user to org list after refetching', async () => {
      await act(() => {
        refetch.mockResolvedValue({ status: 'success' })
        return Promise.resolve()
      })
      screen
        .getByRole('button', {
          name: /refresh list/i,
        })
        .click()

      expect(await screen.findByText('Rabee-AbuBaker')).toBeInTheDocument()
      expect(await screen.findByText('codecov')).toBeInTheDocument()
    })

    it('clicking back sets needs help false and renders org list', async () => {
      screen
        .getByRole('button', {
          name: /back/i,
        })
        .click()

      expect(await screen.findByText('Rabee-AbuBaker')).toBeInTheDocument()
      expect(await screen.findByText('codecov')).toBeInTheDocument()
    })
  })

  describe('when user selects an organization', () => {
    beforeEach(() => {
      setup()
      screen.getByText(/codecov/i).click()
    })

    it('renders repos list', () => {
      expect(screen.getByText('opentelem-ruby')).toBeInTheDocument()
      expect(screen.getByText('impact-analysis')).toBeInTheDocument()
      expect(screen.getByText('codecov-gateway')).toBeInTheDocument()
    })
  })

  describe('when user selects an organization and a repo', () => {
    beforeEach(() => {
      setup()
      screen.getByText(/codecov/i).click()
      screen.getByText(/opentelem-ruby/i).click()
    })

    it('calls onSelect with correct data', () => {
      expect(onSelect).toHaveBeenCalledWith({ selectedOrg, selectedRepo })
    })
  })

  describe('when user skips org selection', () => {
    beforeEach(() => {
      setup()
      screen
        .getByRole('button', {
          name: /skip/i,
        })
        .click()
    })

    it('calls onOnboardingSkip', () => {
      expect(onOnboardingSkip).toHaveBeenCalled()
    })
  })

  describe('when user skips repo selection', () => {
    beforeEach(() => {
      setup()
      screen.getByText(/codecov/i).click()
      screen
        .getByRole('button', {
          name: /skip/i,
        })
        .click()
    })

    it('calls onOnboardingSkip', () => {
      expect(onOnboardingSkip).toHaveBeenCalled()
    })
  })
})
