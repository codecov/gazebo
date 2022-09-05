import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import TrendDropdown from './TrendDropdown'

describe('TrendDropdown', () => {
  let history
  let testLocation

  function setup() {
    history = createMemoryHistory()

    // I don't fully get this * route but it works. Neat!
    render(
      <Router history={history}>
        <TrendDropdown />
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </Router>
    )
  }

  it('updates the search params on select', () => {
    setup()

    const button = screen.getByRole('button', {
      name: /select coverage over time range/,
    })
    userEvent.click(button)
    userEvent.click(screen.getAllByRole('option')[1])

    expect(testLocation.search).toBe('?trend=7%20days')
  })
})
