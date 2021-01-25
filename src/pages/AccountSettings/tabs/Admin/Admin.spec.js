import { render, screen } from '@testing-library/react'

import Admin from './Admin'
import { useUser } from 'services/user'

jest.mock('services/user')
jest.mock('./NameEmailCard', () => () => 'NameEmailCard')
jest.mock('./StudentCard', () => () => 'StudentCard')
jest.mock('./GithubIntegrationCard', () => () => 'GithubIntegrationCard')

describe('AdminTab', () => {
  const defaultProps = {
    provider: 'gh',
    owner: 'codecov',
  }

  function setup(over = {}) {
    useUser.mockReturnValue({ data: {} })
    const props = {
      ...defaultProps,
      ...over,
    }
    render(<Admin {...props} />)
  }

  describe('when rendered for user', () => {
    beforeEach(() => {
      setup({
        isPersonalSettings: true,
      })
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
  })

  describe('when rendered for organization', () => {
    beforeEach(() => {
      setup({
        isPersonalSettings: false,
      })
    })

    it('renders the admin manage section', () => {
      const card = screen.getByText(/add\/remove admin section/)
      expect(card).toBeInTheDocument()
    })

    it('renders the GithubIntegrationCard', () => {
      const card = screen.getByText(/GithubIntegrationCard/)
      expect(card).toBeInTheDocument()
    })
  })
})
