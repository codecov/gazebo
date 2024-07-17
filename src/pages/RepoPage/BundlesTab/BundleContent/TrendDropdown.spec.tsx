import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import qs from 'querystring'

import { TrendDropdown } from './TrendDropdown'

let testLocation: ReturnType<typeof useLocation>
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/']}>
    <Route path="*">
      {({ location }) => {
        testLocation = location
        return children
      }}
    </Route>
  </MemoryRouter>
)

describe('TrendDropdown', () => {
  function setup() {
    const user = userEvent.setup()
    return { user }
  }

  describe('when the trend is not set', () => {
    it('renders the default trend', () => {
      render(<TrendDropdown />, { wrapper })

      const trend = screen.getByText(/3 months/)
      expect(trend).toBeInTheDocument()
    })
  })

  describe('when the trend is set', () => {
    it('renders the selected trend', async () => {
      const { user } = setup()
      render(<TrendDropdown />, { wrapper })

      const trendDropdown = screen.getByText(/3 months/)
      await user.click(trendDropdown)

      const option = screen.getByRole('option', { name: /30 days/ })
      await user.click(option)

      const trend = screen.getByRole('button', {
        name: /bundle-chart-trend-dropdown/,
      })
      expect(trend).toBeInTheDocument()
      expect(trend).toHaveTextContent(/30 days/)
    })

    it('updates the URL params', async () => {
      const { user } = setup()
      render(<TrendDropdown />, { wrapper })

      const trendDropdown = screen.getByText(/3 months/)
      await user.click(trendDropdown)

      const option = screen.getByRole('option', { name: /30 days/ })
      await user.click(option)

      expect(testLocation.search).toBe(`?${qs.stringify({ trend: '30 days' })}`)
    })
  })
})
