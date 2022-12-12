import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ToggleChart from './ToggleChart'

import { useBranchSelector, useRepoCoverageTimeseries } from '../hooks'

jest.mock('./Chart', () => () => 'Chart')
jest.mock('../hooks')
jest.spyOn(window.localStorage.__proto__, 'setItem')

window.localStorage.__proto__.setItem = jest.fn()

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/critical-role/c3/bells-hells']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('Toggle chart', () => {
  function setup({ chartData }) {
    useBranchSelector.mockReturnValue({ selection: { name: 'bells-hells' } })
    useRepoCoverageTimeseries.mockReturnValue(chartData)
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
      render(<ToggleChart />, { wrapper })

      expect(screen.getByText('Hide Chart')).toBeInTheDocument()
      expect(screen.getByText('chevron-down.svg')).toBeInTheDocument()
    })

    it('renders the chart', () => {
      render(<ToggleChart />, { wrapper })

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
    })

    it('renders show chart', () => {
      render(<ToggleChart />, { wrapper })
      screen.getByText('Hide Chart').click()

      expect(screen.getByText('Show Chart')).toBeInTheDocument()
    })

    it('hides the chart', () => {
      render(<ToggleChart />, { wrapper })
      screen.getByText('Hide Chart').click()

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
      render(<ToggleChart />, { wrapper })

      expect(screen.queryByText('Show Chart')).not.toBeInTheDocument()
    })

    it('does not render the chart', () => {
      render(<ToggleChart />, { wrapper })

      expect(screen.queryByText('Chart')).not.toBeInTheDocument()
    })
  })
})
