import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('Header', () => {
  function setup(props = {}) {
    render(
      <MemoryRouter initialEntries={['/analytics/gh/codecov']}>
        <Route path="/analytics/:provider/:owner">
          <Header {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('render', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'dwight',
        },
      })
    })

    it('renders the context switcher', () => {
      expect(screen.getByText(/MyContextSwitcher/)).toBeInTheDocument()
    })
  })
})
