import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useMyContexts } from 'services/user'

import DefaultOrganizationSelector from './DefaultOrganizationSelector'

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

describe('OrganizationSelector', () => {
  let container
  const onClose = jest.fn()
  function setup() {
    useMyContexts.mockReturnValue({
      data: contextData,
    })(
      ({ container } = render(
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <DefaultOrganizationSelector onClose={onClose} />
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
      expect(
        screen.getByText(/Select default organization/)
      ).toBeInTheDocument()
    })

    it('renders subtitle', () => {
      expect(
        screen.getByText(/Org will appear as default for landing page context/)
      ).toBeInTheDocument()
    })

    it('renders organizations list', () => {
      expect(screen.getByText('Rabee-AbuBaker')).toBeInTheDocument()
      expect(screen.getByText('codecov')).toBeInTheDocument()
    })

    it('renders footer', () => {
      expect(
        screen.getByRole('button', {
          name: /cancel/i,
        })
      ).toBeInTheDocument()

      const updateButton = screen.getByRole('button', {
        name: /Update/i,
      })

      expect(updateButton).toBeInTheDocument()
      expect(updateButton).toBeDisabled()
    })
  })

  describe('when user selects an organization', () => {
    beforeEach(() => {
      setup()
      screen.getByText(/codecov/i).click()
    })

    it('enabled update button', () => {
      expect(
        screen.getByRole('button', {
          name: /Update/i,
        })
      ).toBeEnabled()
    })

    describe('when user clicks update', () => {
      beforeEach(() => {
        screen
          .getByRole('button', {
            name: /Update/i,
          })
          .click()
      })

      it('stores selected org to the localstorage', () => {
        expect(localStorage.setItem).toBeCalledWith(
          'gz-defaultOrganization',
          '"codecov"'
        )
      })

      it('calls onClose', () => {
        expect(onClose).toBeCalled()
      })
    })
  })

  describe('when user clicks cancel', () => {
    beforeEach(() => {
      setup()
      screen.getByText(/cancel/i).click()
    })

    it('calls onClose', () => {
      expect(onClose).toBeCalled()
    })
  })
})
