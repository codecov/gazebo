import { render, screen } from '@testing-library/react'
import AnalyticsPage from './AnalyticsPage'
import { useOwner } from 'services/user'
import { MemoryRouter, Route } from 'react-router-dom'

jest.mock('./Header', () => () => 'Header')
jest.mock('services/user')
jest.mock('services/account')
jest.mock('./Tabs', () => () => 'Tabs')

describe('AnalyticsPage', () => {
  function setup(owner) {
    useOwner.mockReturnValue({
      data: owner,
    })
    render(
      <MemoryRouter initialEntries={['/analytics/gh/codecov']}>
        <Route path="/analytics/:provider/:owner">
          <AnalyticsPage />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when the owner exists', () => {
    beforeEach(() => {
      setup({
        username: 'codecov',
        isCurrentUserPartOfOrg: true,
      })
    })

    it('renders the header', () => {
      expect(screen.getByText(/Header/)).toBeInTheDocument()
    })

    it('renders tabs associated with the page', () => {
      expect(screen.queryByText(/Tabs/)).toBeInTheDocument()
    })
  })

  describe('when the owner doesnt exist', () => {
    beforeEach(() => {
      setup(null)
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

  describe('when user is not part of the org', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: false,
        },
      })
    })

    it('doesnt render Tabs', () => {
      expect(screen.queryByText(/Tabs/)).not.toBeInTheDocument()
    })
  })
})
