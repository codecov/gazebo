import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useRepoOverview } from 'services/repo'

import ToggleChart from './ToggleChart'

import { useBranchSelector, useRepoCoverageTimeseries } from '../hooks'

jest.mock('./Chart', () => () => 'Chart')
jest.mock('services/branches')
jest.mock('services/repo')
jest.mock('../hooks')
jest.spyOn(window.localStorage.__proto__, 'setItem')

window.localStorage.__proto__.setItem = jest.fn()

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/critical-role/c3/bells-hells']}>
    <Route path="/:provider/:owner/:repo">{children}</Route>
  </MemoryRouter>
)

describe('Toggle chart', () => {
  function setup({ chartData }) {
    useRepoCoverageTimeseries.mockReturnValue(chartData)
    useRepoOverview.mockReturnValue({})
    useBranches.mockReturnValue({})
    useBranchSelector.mockReturnValue({ selection: { name: 'bells-hells' } })
    render(<ToggleChart />, {
      wrapper,
    })
  }

  describe('Toggle chart with successfull repo coverage data', () => {
    beforeEach(() => {
      setup({
        chartData: {
          isSuccess: true,
        },
      })
    })

    it('renders the default chart toggle', () => {
      expect(screen.getByText('Hide Chart')).toBeInTheDocument()
      expect(screen.getByText('chevron-down.svg')).toBeInTheDocument()
    })

    it('renders the chart', () => {
      expect(screen.getByText('Chart')).toBeInTheDocument()
      expect(screen.getByText('Chart')).not.toHaveClass('hidden')
    })
  })

  describe('Toggle and hide the chart', () => {
    beforeEach(() => {
      setup({
        chartData: {
          isSuccess: true,
        },
      })
      screen.getByText('Hide Chart').click()
    })

    it('renders show chart', () => {
      expect(screen.getByText('Show Chart')).toBeInTheDocument()
    })

    it('hides the chart', () => {
      expect(screen.getByText('Chart')).toHaveClass('hidden')
    })
  })

  describe('Toggle chart when coverage data is not successfull', () => {
    beforeEach(() => {
      setup({
        chartData: {
          isSuccess: false,
        },
      })
    })

    it('does not render show chart', () => {
      expect(screen.queryByText('Show Chart')).not.toBeInTheDocument()
    })

    it('does not render the chart', () => {
      expect(screen.queryByText('Chart')).not.toBeInTheDocument()
    })
  })
})
