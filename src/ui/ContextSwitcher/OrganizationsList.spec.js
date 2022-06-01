import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useMyContexts } from 'services/user'

import OrganizationsList from './OrganizationsList'

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

const selectedOrg = 'codecov'

describe('OrganizationsList', () => {
  const onSelect = jest.fn()
  function setup(withLocalStorage) {
    if (withLocalStorage) {
      window.localStorage.setItem(
        'gz-defaultOrganization',
        JSON.stringify('codecov')
      )
    }

    useMyContexts.mockReturnValue({
      data: contextData,
    })(
      render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <OrganizationsList onSelect={onSelect} />
          </Route>
        </MemoryRouter>
      )
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders all organizations', () => {
      expect(screen.getByText(/codecov/i)).toBeInTheDocument()
      expect(screen.getByText(/Rabee-AbuBaker/i)).toBeInTheDocument()
      expect(screen.getByText(/Show all orgs and repos/i)).toBeInTheDocument()
    })
  })

  describe('when there is a previously selected default org', () => {
    beforeEach(() => {
      setup(true)
    })

    it('renders current org view next to it', () => {
      expect(screen.getByText(/Current org view/i)).toBeInTheDocument()
    })

    it('renders the default org at the top of the list', () => {
      expect(screen.queryAllByRole('listitem')[0]).toHaveTextContent(
        selectedOrg
      )
    })
  })

  describe('when user selects an organization', () => {
    beforeEach(() => {
      setup()
      const organization = screen.getByText(/codecov/i)
      expect(organization).toBeInTheDocument()
      fireEvent.click(organization)
    })

    it('calls onSelect with organization value', () => {
      expect(onSelect).toHaveBeenCalledWith(selectedOrg)
    })
  })
})
