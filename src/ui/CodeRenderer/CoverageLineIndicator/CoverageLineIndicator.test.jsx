import { render, screen } from '@testing-library/react'

import CoverageLineIndicator from './CoverageLineIndicator'

describe('CoverageLineIndicator', () => {
  describe('rendering icons', () => {
    it('renders uncovered alert icon', () => {
      render(<CoverageLineIndicator coverage="UNCOVERED" />)

      const icon = screen.getByTestId('exclamationTriangle')
      expect(icon).toBeInTheDocument()
    })

    it('renders partial alert icon', () => {
      render(<CoverageLineIndicator coverage="PARTIAL" />)

      const icon = screen.getByTestId('partial-icon')
      expect(icon).toBeInTheDocument()
    })

    it('does not render icons on covered', () => {
      render(<CoverageLineIndicator coverage="COVERED" />)

      const partialIcon = screen.queryByTestId('partial-icon')
      expect(partialIcon).not.toBeInTheDocument()

      const exclamationTriangle = screen.queryByTestId('exclamationTriangle')
      expect(exclamationTriangle).not.toBeInTheDocument()
    })

    it('does not render icons on blank', () => {
      render(<CoverageLineIndicator coverage="BLANK" />)

      const partialIcon = screen.queryByTestId('partial-icon')
      expect(partialIcon).not.toBeInTheDocument()

      const exclamationTriangle = screen.queryByTestId('exclamationTriangle')
      expect(exclamationTriangle).not.toBeInTheDocument()
    })
  })

  describe('rendering hit count', () => {
    it('does not render when no hit count is provided', () => {
      render(<CoverageLineIndicator coverage="BLANK" />)

      const hitCount = screen.queryByText('10')
      expect(hitCount).not.toBeInTheDocument()
    })

    it('renders yellow hit count on partial', () => {
      render(<CoverageLineIndicator coverage="PARTIAL" hitCount={10} />)

      const hitCount = screen.getByText('10')
      expect(hitCount).toBeInTheDocument()
      expect(hitCount).toHaveClass('bg-ds-primary-yellow')
    })

    it('renders red hit count on uncovered', () => {
      render(<CoverageLineIndicator coverage="UNCOVERED" hitCount={10} />)

      const hitCount = screen.getByText('10')
      expect(hitCount).toBeInTheDocument()
      expect(hitCount).toHaveClass('bg-ds-primary-red')
    })

    it('renders green hit count on covered', () => {
      render(<CoverageLineIndicator coverage="COVERED" hitCount={10} />)

      const hitCount = screen.getByText('10')
      expect(hitCount).toBeInTheDocument()
      expect(hitCount).toHaveClass('bg-ds-primary-green')
    })

    it('does not render hit count on blank', () => {
      render(<CoverageLineIndicator coverage="BLANK" hitCount={10} />)

      const hitCount = screen.queryByText('10')
      expect(hitCount).not.toBeInTheDocument()
    })

    it('does not render hit count when count is zero', () => {
      render(<CoverageLineIndicator coverage="COVERED" hitCount={0} />)

      const hitCount = screen.queryByText('10')
      expect(hitCount).not.toBeInTheDocument()
    })
  })
})
