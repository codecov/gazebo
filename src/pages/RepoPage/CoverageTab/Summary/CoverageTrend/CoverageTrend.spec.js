import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import CoverageTrend from './CoverageTrend'

import { useBranchSelector } from '../hooks/useBranchSelector'
import { useSparkline } from '../hooks/useSparkline'

jest.mock('../hooks/useSparkline')
jest.mock('../hooks/useBranchSelector')
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
    useSparkline.mockReturnValue(sparklineData)
    useBranchSelector.mockReturnValue({
      selection: { name: 'bells-hells' },
    })

    return render(<CoverageTrend />, { wrapper })
  }

  describe('trend sparkline', () => {
    it('renders a sparkline', () => {
      setup({
        sparklineData: {
          coverage: [{ coverage: 81 }, { coverage: 30 }, { coverage: 45 }],
          coverageChange: -40,
          isSuccess: true,
        },
      })
      expect(
        screen.getByText(/The bells-hells branch coverage trend/)
      ).toBeInTheDocument()
    })

    it('renders the coverage change', () => {
      setup({
        sparklineData: {
          coverage: [{ coverage: 81 }, { coverage: 30 }, { coverage: 45 }],
          coverageChange: -40,
          isSuccess: true,
        },
      })
      expect(screen.getByText(/-40/)).toBeInTheDocument()
    })

    it('plots each coverage point on the sparkline', () => {
      setup({
        sparklineData: {
          coverage: [{ coverage: 81 }, { coverage: 30 }, { coverage: 45 }],
          coverageChange: -40,
          isSuccess: true,
        },
      })
      expect(screen.getByText(/coverage: 81%/)).toBeInTheDocument()
      expect(screen.getByText(/coverage: 30%/)).toBeInTheDocument()
      expect(screen.getByText(/coverage: 45%/)).toBeInTheDocument()
    })

    it('Handles cases where there is no coverage in the selected time span', () => {
      setup({
        sparklineData: {
          coverage: [],
          coverageChange: -40,
          isSuccess: true,
        },
      })

      expect(
        screen.getByText(/No coverage reports found in this timespan./)
      ).toBeInTheDocument()
    })
  })

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
