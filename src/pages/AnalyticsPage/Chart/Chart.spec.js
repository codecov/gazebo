import Chart from './Chart'
import { render, screen } from '@testing-library/react'
import { useOrgCoverage } from 'services/charts'

jest.mock('services/charts')

describe('Analytics coverage chart', () => {
  function setup({ provider, owner, params, chart }) {
    useOrgCoverage.mockReturnValue({
      data: { coverage: chart },
    })
    render(<Chart provider={provider} owner={owner} params={params} />)
  }

  describe('No coverage data exists', () => {
    beforeEach(() => {
      setup({
        provider: 'gh',
        owner: 'codecov',
        params: {
          startDate: '2020-01-15',
          endDate: '2020-01-19',
          repositories: [],
        },
        chart: [],
      })
    })

    it('renders no chart', () => {
      expect(screen.queryAllByRole('presentation').length).toBe(0)
    })
  })

  describe('Chart with data', () => {
    beforeEach(() => {
      setup({
        provider: 'gh',
        owner: 'codecov',
        params: {
          startDate: '2020-01-15',
          endDate: '2020-01-19',
          repositories: [],
        },
        chart: [
          { date: '2020-01-15T20:18:39.413Z', coverage: 20 },
          { date: '2020-01-17T20:18:39.413Z', coverage: 50 },
        ],
      })
    })

    it('renders victory', () => {
      expect(screen.getByRole('img')).toBeInTheDocument(0)
    })

    it('renders a screen reader friendly description', () => {
      expect(
        screen.getByText(
          'Organization wide coverage chart from Jan 15, 2020 to Jan 17, 2020, coverage change is +20%'
        )
      ).toBeInTheDocument()
    })
  })
})
