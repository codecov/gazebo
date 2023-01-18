import { render, screen } from '@testing-library/react'

import CoverageProgress from './CoverageProgress'

describe('CoverageProgress', () => {
  describe('when rendered', () => {
    it('renders commit coverage', () => {
      render(
        <CoverageProgress
          commitid="123456789"
          totals={{
            coverage: 45,
          }}
        />
      )

      const coverage = screen.getByText(/45.00%/)
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('when rendered with no coverage', () => {
    it('renders no report text', () => {
      render(
        <CoverageProgress
          commitid="123456789"
          totals={{
            coverage: null,
          }}
        />
      )

      const text = screen.getByText(/No report uploaded/)
      expect(text).toBeInTheDocument()
    })
  })
})
