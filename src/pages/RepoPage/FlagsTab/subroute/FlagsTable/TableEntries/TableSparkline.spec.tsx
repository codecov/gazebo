import { render, screen } from '@testing-library/react'

import TableSparkline, { TableSparklineProps } from './TableSparkline'

const measurements = [
  { avg: 51.78 },
  { avg: 67.89 },
  { avg: 81.26 },
  { avg: 93.356 },
  { avg: null },
]

describe('TableSparkline', () => {
  function setup(props: TableSparklineProps) {
    render(<TableSparkline {...props} />)
  }

  describe('when rendered with valid data', () => {
    beforeEach(() => {
      setup({
        change: 1.65,
        name: 'unit',
        measurements,
      })
    })

    it('renders a sparkline caption', () => {
      expect(screen.getByText(/Flag unit trend sparkline/)).toBeInTheDocument()
    })

    it('renders change correctly', () => {
      expect(screen.getByText(/1.65/)).toBeInTheDocument()
    })

    it('data points have correct value descriptors', () => {
      expect(screen.getByText(/51.78%/)).toBeInTheDocument()
      expect(screen.getByText(/67.89%/)).toBeInTheDocument()
      expect(screen.getByText(/81.26%/)).toBeInTheDocument()
      expect(screen.getByText(/93.356%/)).toBeInTheDocument()
      expect(screen.getByText(/No Data Available/)).toBeInTheDocument()
    })
  })

  describe('when data is empty', () => {
    beforeEach(() => {
      setup({
        change: null,
        name: 'unit',
        measurements: [{ avg: null }, { avg: null }, { avg: null }],
      })
    })

    it('renders change as no data', () => {
      expect(screen.getByText('No Data')).toBeInTheDocument()
    })

    it('renders dotted line', () => {
      expect(screen.getByText(/No Data Available/)).toBeInTheDocument()
      expect(screen.getAllByText(/No Data Available/).length).toBe(1)
    })
  })
})
