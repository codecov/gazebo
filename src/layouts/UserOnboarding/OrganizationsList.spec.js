import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useMyContexts } from 'services/user'

import OrganizationsList from './OrganizationsList'

jest.spyOn(window.localStorage.__proto__, 'setItem')
window.localStorage.__proto__.setItem = jest.fn()

jest.mock('services/user')

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

describe('OrganizationsList', () => {
  let container
  const onSubmit = jest.fn()
  const refetch = jest.fn()
  const setIsHelpFindingOrg = jest.fn()
  function setup(isHelpFindingOrg) {
    useMyContexts.mockReturnValue({
      data: contextData,
      refetch: refetch,
    })(
      ({ container } = render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationsList
              onSubmit={onSubmit}
              isHelpFindingOrg={isHelpFindingOrg}
              setIsHelpFindingOrg={setIsHelpFindingOrg}
            />
          </Route>
        </MemoryRouter>
      ))
    )
  }

  describe('when rendered with isHelpFindingOrg false', () => {
    beforeEach(() => {
      setup()
    })

    it('renders organizations list', () => {
      expect(container).toBeInTheDocument()
      expect(screen.getByText('Rabee-AbuBaker')).toBeInTheDocument()
      expect(screen.getByText('codecov')).toBeInTheDocument()
    })
  })

  describe('when user selects an organization', () => {
    beforeEach(() => {
      setup()
      const organization = screen.getByText(/codecov/i)
      expect(organization).toBeInTheDocument()
      fireEvent.click(organization)
    })

    it('stores organization name in localstorage', () => {
      expect(localStorage.setItem).toBeCalledWith(
        'gz-defaultOrganization',
        '"codecov"'
      )
    })

    it('calls submit with organization value', () => {
      expect(onSubmit).toHaveBeenCalledWith(selectedOrg)
    })
  })

  describe('when rendered with isHelpFindingOrg true', () => {
    beforeEach(() => {
      setup(true)
    })

    it('اelp find org view is rendered', () => {
      expect(screen.getByText(/Enable org access/)).toBeInTheDocument()
    })

    it('renders links with correct href', () => {
      expect(
        screen.getByRole('link', {
          name: /approval for third party access/i,
        })
      ).toHaveAttribute(
        'href',
        'https://docs.github.com/en/organizations/restricting-access-to-your-organizations-data/enabling-oauth-app-access-restrictions-for-your-organization'
      )

      const accessSettingsLinks = screen.getAllByRole('link', {
        name: /access settings/i,
      })

      expect(accessSettingsLinks.length).toBe(3)

      expect(accessSettingsLinks[0]).toHaveAttribute(
        'href',
        'https://github.com/settings/connections/applications/c68c81cbfd179a50784a'
      )
      expect(accessSettingsLinks[1]).toHaveAttribute(
        'href',
        'https://github.com/settings/connections/applications/c68c81cbfd179a50784a'
      )

      expect(accessSettingsLinks[2]).toHaveAttribute(
        'href',
        'https://github.com/settings/connections/applications/c68c81cbfd179a50784a'
      )
    })
  })

  describe('when refresh list is clicked', () => {
    beforeEach(async () => {
      setup(true)
      await act(() => {
        refetch.mockResolvedValue({ status: 'success' })
        return Promise.resolve()
      })
    })

    it('refetch and setIsHelpFindingOrg are called', async () => {
      screen.getByRole('button', /refresh list/).click()
      expect(refetch).toHaveBeenCalled()
      await waitFor(() =>
        expect(setIsHelpFindingOrg).toHaveBeenCalledWith(false)
      )
    })
  })
})
