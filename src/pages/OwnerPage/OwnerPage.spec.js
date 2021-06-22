import { render, screen } from '@testing-library/react'
import OwnerPage from './OwnerPage'
import { useOwner } from 'services/user'
import { MemoryRouter, Route } from 'react-router-dom'

jest.mock('./Header', () => () => 'Header')
jest.mock('services/user')
jest.mock('shared/ListRepo', () => () => 'ListRepo')

describe('OwnerPage', () => {
  function setup(owner) {
    useOwner.mockReturnValue({
      data: owner,
    })
    render(
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">
          <OwnerPage />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when the owner exists', () => {
    beforeEach(() => {
      setup({
        username: 'codecov',
        isCurrentUserPartOfOrg: false,
      })
    })

    it('renders the ListRepo', () => {
      expect(screen.getByText(/ListRepo/)).toBeInTheDocument()
    })

    it('renders the header', () => {
      expect(screen.getByText(/Header/)).toBeInTheDocument()
    })
  })

  describe('when the owner doesnt exist', () => {
    beforeEach(() => {
      setup(null)
    })

    it('doesnt render the ListRepo', () => {
      expect(screen.queryByText(/ListRepo/)).not.toBeInTheDocument()
    })

    it('doesnt render the header', () => {
      expect(screen.queryByText(/Header/)).not.toBeInTheDocument()
    })

    it('renders a not found error page', () => {
      expect(
        screen.getByRole('heading', {
          name: /not found/i,
        })
      ).toBeInTheDocument()
    })
  })
})
