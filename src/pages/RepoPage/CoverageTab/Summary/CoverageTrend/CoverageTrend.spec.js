import { render, screen } from '@testing-library/react'

import CoverageTrend from './CoverageTrend'

import { useSummary } from '../hooks'

jest.mock('../hooks')
jest.mock('../TrendDropdown', () => () => 'TrendDropdown')

describe('CoverageTrend', () => {
  function setup({ summaryData }) {
    useSummary.mockReturnValue(summaryData)

    return render(<CoverageTrend />)
  }

  describe('trend sparkline', () => {
    it('renders a sparkline', () => {
      setup({
        summaryData: {
          coverage: [{ coverage: 81 }, { coverage: 30 }, { coverage: 45 }],
          currentBranchSelected: {
            name: 'bells-hells',
          },
          coverageChange: -40,
          legacyApiIsSuccess: true,
        },
      })
      expect(
        screen.getByText(/The bells-hells branch coverage trend/)
      ).toBeInTheDocument()
    })

    it('the coverage change', () => {
      setup({
        summaryData: {
          coverage: [{ coverage: 81 }, { coverage: 30 }, { coverage: 45 }],
          currentBranchSelected: {
            name: 'bells-hells',
          },
          coverageChange: -40,
          legacyApiIsSuccess: true,
        },
      })
      expect(screen.getByText(/-40/)).toBeInTheDocument()
    })

    it('plots each coverage point on the sparkline', () => {
      setup({
        summaryData: {
          coverage: [{ coverage: 81 }, { coverage: 30 }, { coverage: 45 }],
          currentBranchSelected: {
            name: 'bells-hells',
          },
          coverageChange: -40,
          legacyApiIsSuccess: true,
        },
      })
      expect(screen.getByText(/coverage: 81%/)).toBeInTheDocument()
      expect(screen.getByText(/coverage: 30%/)).toBeInTheDocument()
      expect(screen.getByText(/coverage: 45%/)).toBeInTheDocument()
    })

    it('Handles cases where there is no coverage in the selected time span', () => {
      setup({
        summaryData: {
          coverage: [],
          currentBranchSelected: {
            name: 'bells-hells',
          },
          coverageChange: -40,
          legacyApiIsSuccess: true,
        },
      })

      expect(
        screen.getByText(/No coverage reports found in this timespan./)
      ).toBeInTheDocument()
    })
  })

  describe('render nothing if the api call fails', () => {
    setup({
      summaryData: {
        legacyApiIsSuccess: false,
      },
    })

    expect(
      screen.queryByText(/No coverage reports found in this timespan./)
    ).not.toBeInTheDocument()
  })
})
