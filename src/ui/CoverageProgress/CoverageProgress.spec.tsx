import { render, screen } from '@testing-library/react'

import CoverageProgress from './CoverageProgress'

describe('CoverageProgress', () => {
  describe('when rendered', () => {
    it('renders commit coverage', () => {
      render(<CoverageProgress amount={45} />)

      const coverage = screen.getByText(/45.00%/)
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('when rendered with no coverage', () => {
    it('renders no report text', () => {
      render(<CoverageProgress amount={null} />)

      const text = screen.getByText(/No report uploaded/)
      expect(text).toBeInTheDocument()
    })
  })

  describe('when rendered as tall variant', () => {
    it('light is not applied to totals number', () => {
      render(<CoverageProgress amount={45} variant="tall" />)

      const totalsNumber = screen.getByTestId('coverage-value')
      expect(totalsNumber).not.toHaveClass('light')
    })
  })
})
