import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import OwnerPage from './OwnerPage'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('OwnerPage', () => {
  function setup() {
    render(<OwnerPage />, {
      wrapper: (props) => (
        <MemoryRouter initialEntries={['/gh/codecov']}>
          <Route path="/:provider/:owner" exact>
            {props.children}
          </Route>
        </MemoryRouter>
      ),
    })
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the children', () => {
      expect(
        screen.getByText(/SHOW ALL THE REPOS OF codecov/)
      ).toBeInTheDocument()
    })
  })
})
