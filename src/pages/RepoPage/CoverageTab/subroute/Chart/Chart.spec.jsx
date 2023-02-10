import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useRepoOverview } from 'services/repo'

import Chart from './Chart'

import { useBranchSelector, useRepoCoverageTimeseries } from '../../hooks'

jest.mock('services/branches')
jest.mock('services/repo')
jest.mock('../../hooks')

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/critical-role/c3/bells-hells']}>
    <Route path="/:provider/:owner/:repo">{children}</Route>
  </MemoryRouter>
)

describe('Coverage Tab chart', () => {
  function setup({ chartData }) {
    useRepoCoverageTimeseries.mockReturnValue(chartData)
    useRepoOverview.mockReturnValue({})
    useBranches.mockReturnValue({})
    useBranchSelector.mockReturnValue({ selection: { name: 'bells-hells' } })
  }

  describe('No coverage data exists', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2020-04-01'))

      setup({
        chartData: {},
      })
    })
    afterAll(() => {
      jest.useRealTimers()
    })

    it('renders no chart', () => {
      render(<Chart />, {
        wrapper,
      })

      expect(screen.queryAllByRole('presentation').length).toBe(0)
    })
  })

  describe('Chart with data', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2020-04-01'))

      setup({
        chartData: {
          data: {
            coverageAxisLabel: (t) => t,
            coverage: [
              { date: '2020-01-15T20:18:39.413Z', coverage: 20 },
              { date: '2020-01-17T20:18:39.413Z', coverage: 50 },
            ],
          },
          isSuccess: true,
        },
      })
    })
    afterAll(() => {
      jest.useRealTimers()
    })

    it('renders victory', () => {
      render(<Chart />, {
        wrapper,
      })

      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('renders a screen reader description', () => {
      render(<Chart />, {
        wrapper,
      })

      expect(
        screen.getByText(
          'bells-hells coverage chart from Jan 15, 2020 to Jan 17, 2020, coverage change is +20%'
        )
      ).toBeInTheDocument()
    })
  })

  describe('Not enough data to render', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2020-04-01'))

      setup({
        chartData: {
          data: {
            coverageAxisLabel: (t) => t,
            coverage: [{ date: '2020-01-15T20:18:39.413Z', coverage: 20 }],
          },
          isSuccess: true,
        },
      })
    })
    afterAll(() => {
      jest.useRealTimers()
    })

    it('renders victory', () => {
      render(<Chart />, {
        wrapper,
      })

      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('renders not enough data', () => {
      render(<Chart />, {
        wrapper,
      })

      expect(screen.getByText('Not enough data to render')).toBeInTheDocument()
    })
  })
})
