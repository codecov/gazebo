import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import TrendDropdown from './TrendDropdown'

let testLocation

const history = createMemoryHistory()
const wrapper =
  () =>
  ({ children }) => (
    <Router history={history}>
      {children}
      <Route
        path="*"
        render={({ location }) => {
          testLocation = location
          return null
        }}
      />
    </Router>
  )

describe('TrendDropdown', () => {
  it('updates the search params on select', async () => {
    const user = userEvent.setup()
    render(<TrendDropdown />, { wrapper: wrapper() })

    const button = screen.getByRole('button', {
      name: /select coverage over time range/,
    })

    await user.click(button)
    await user.click(screen.getAllByRole('option')[1])

    expect(testLocation.search).toBe('?trend=30%20days')
  })
})
