import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

import Admin from './Admin'

jest.mock('services/user')
jest.mock('./NameEmailCard', () => () => 'NameEmailCard')
jest.mock('./StudentCard', () => () => 'StudentCard')
jest.mock('./GithubIntegrationCard', () => () => 'GithubIntegrationCard')
jest.mock('./ManageAdminCard', () => () => 'ManageAdminCard')
jest.mock('./DeletionCard', () => () => 'DeletionCard')
jest.mock('shared/featureFlags')

describe('AdminTab', () => {
  const defaultProps = {
    provider: 'gh',
    owner: 'codecov',
  }

  function setup({ owner, showThemeToggle = false }) {
    useUser.mockReturnValue({
      data: {
        user: {
          username: 'terry',
        },
      },
    })
    const props = {
      ...defaultProps,
      owner,
    }

    useFlags.mockReturnValue({ showThemeToggle })

    render(
      <MemoryRouter initialEntries={['/account/gh/codecov']}>
        <Route path="/account/:provider/:owner/">
          <Admin {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered for user', () => {
    beforeEach(() => {
      setup({ owner: 'terry' })
    })

    it('renders the NameEmailCard', () => {
      const card = screen.getByText(/NameEmailCard/)
      expect(card).toBeInTheDocument()
    })

    it('renders the StudentCard', () => {
      const card = screen.getByText(/StudentCard/)
      expect(card).toBeInTheDocument()
    })

    it('renders the GithubIntegrationCard', () => {
      const card = screen.getByText(/GithubIntegrationCard/)
      expect(card).toBeInTheDocument()
    })

    it('renders the DeletionCard', () => {
      const card = screen.getByText(/DeletionCard/)
      expect(card).toBeInTheDocument()
    })
  })

  describe('when rendered for organization', () => {
    beforeEach(() => {
      setup({ owner: '' })
    })

    it('renders the ManageAdminCard', () => {
      const card = screen.getByText(/ManageAdminCard/)
      expect(card).toBeInTheDocument()
    })

    it('renders the GithubIntegrationCard', () => {
      const card = screen.getByText(/GithubIntegrationCard/)
      expect(card).toBeInTheDocument()
    })

    it('renders the DeletionCard', () => {
      const card = screen.getByText(/DeletionCard/)
      expect(card).toBeInTheDocument()
    })
  })

  describe('when show theme toggle flag is set to true', () => {
    beforeEach(() => {
      setup({ owner: 'rula', showThemeToggle: true })
    })

    it('renders colorblind label', () => {
      const label = screen.getByText(/Colorblind Friendly/)
      expect(label).toBeInTheDocument()
    })

    it('renders colorblind toggle', () => {
      const button = screen.getByTestId('switch')
      expect(button).toBeInTheDocument()
    })

    describe('on toggle switch', () => {
      window.localStorage.__proto__.setItem = jest.fn()

      beforeEach(() => {
        screen.getByTestId('switch').click()
      })

      it('sets color-blind theme in local storage', () => {
        expect(localStorage.setItem).toBeCalledWith(
          'current-theme',
          'color-blind'
        )
      })
    })
  })
})
