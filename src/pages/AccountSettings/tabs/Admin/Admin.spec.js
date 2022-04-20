import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUser } from 'services/user'

import Admin from './Admin'

jest.mock('services/user')
jest.mock('./NameEmailCard', () => () => 'NameEmailCard')
jest.mock('./StudentCard', () => () => 'StudentCard')
jest.mock('./GithubIntegrationCard', () => () => 'GithubIntegrationCard')
jest.mock('./ManageAdminCard', () => () => 'ManageAdminCard')
jest.mock('./DeletionCard', () => () => 'DeletionCard')

describe('AdminTab', () => {
  const defaultProps = {
    provider: 'gh',
    owner: 'codecov',
  }

  function setup({ owner }) {
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
})
