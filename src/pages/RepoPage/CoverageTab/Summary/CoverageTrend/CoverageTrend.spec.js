import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import CoverageTrend from './CoverageTrend'

import { useBranchSelector, useRepoCoverageTimeseries } from '../../hooks'

jest.mock('../../hooks')
jest.mock('../TrendDropdown', () => () => 'TrendDropdown')

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={[`/gh/caleb/mighty-nein`]}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('CoverageTrend', () => {
  function setup({ sparklineData }) {
    useRepoCoverageTimeseries.mockReturnValue(sparklineData)
    useBranchSelector.mockReturnValue({
      selection: { name: 'bells-hells' },
    })

    return render(<CoverageTrend />, { wrapper })
  }

  describe('render nothing if the api call fails', () => {
    setup({
      sparklineData: {
        isSuccess: false,
      },
    })

    it('does not render the sparkline', () => {
      expect(
        screen.queryByText(/No coverage reports found in this timespan./)
      ).not.toBeInTheDocument()
    })
  })
})
