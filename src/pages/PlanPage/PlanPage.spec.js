import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useIsPersonalAccount } from 'services/useIsPersonalAccount'
import { useOwner } from 'services/user'

import PlanPage from './PlanPage'

jest.mock('./Header', () => () => 'Header')
jest.mock('services/user')
jest.mock('services/useIsPersonalAccount')
jest.mock('services/navigation')
jest.mock('./Tabs', () => () => 'Tabs')

describe('PlanPage', () => {
  function setup({ owner = null, show = true }) {
    useIsPersonalAccount.mockReturnValue(show)
    useOwner.mockReturnValue({
      data: owner,
    })
    render(
      <MemoryRouter initialEntries={['/plan/gh/codecov']}>
        <Route path="/plan/:provider/:owner">
          <PlanPage />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when the owner exists', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
      })
    })

    it('renders the header', () => {
      expect(screen.getByText(/Header/)).toBeInTheDocument()
    })

    it('renders tabs associated with the page', () => {
      expect(screen.getByText(/Tabs/)).toBeInTheDocument()
    })
  })

  describe('when user is not part of the org', () => {
    beforeEach(() => {
      setup({
        owner: {
          owner: {
            username: 'codecov',
            isCurrentUserPartOfOrg: false,
          },
        },
      })
    })

    it('doesnt render Tabs', () => {
      expect(screen.queryByText(/Tabs/)).not.toBeInTheDocument()
    })
  })
})
