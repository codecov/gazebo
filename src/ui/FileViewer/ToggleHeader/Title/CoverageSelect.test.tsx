import { render, screen } from '@testing-library/react'

import { LINE_STATE } from 'shared/utils/fileviewer'

import { CoverageSelect } from './CoverageSelect'

describe('CoverageSelect', () => {
  describe('renders covered', () => {
    it('covered', () => {
      render(<CoverageSelect coverage={LINE_STATE.COVERED} />)

      const covered = screen.getByText('covered')
      expect(covered).toBeInTheDocument()
    })
  })

  describe('renders uncovered', () => {
    it('uncovered', () => {
      render(<CoverageSelect coverage={LINE_STATE.UNCOVERED} />)

      const uncovered = screen.getByText('uncovered')
      expect(uncovered).toBeInTheDocument()
    })
  })

  describe('renders partial', () => {
    it('partial', () => {
      render(<CoverageSelect coverage={LINE_STATE.PARTIAL} />)

      const partial = screen.getByText('partial')
      expect(partial).toBeInTheDocument()
    })
  })
})
