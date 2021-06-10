import { render, screen } from '@testing-library/react'
import CoverageReportCard from './CoverageReportCard'

describe('CoverageReportCard', () => {
  function setup() {
    render(<CoverageReportCard />)
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the title', () => {
      expect(screen.getByText(/Coverage report/)).toBeInTheDocument()
    })
  })
})
