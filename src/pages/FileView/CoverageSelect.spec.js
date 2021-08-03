import { render, screen } from '@testing-library/react'
import CoverageSelect from './CoverageSelect'

const onChange = jest.fn(() => {})

describe('CoverageSelect', () => {
  function setup(coverage) {
    render(
      <CoverageSelect coverage={coverage} checked={false} onChange={onChange} />
    )
  }

  describe('renders covered', () => {
    beforeEach(() => {
      setup(1)
    })

    it('covered', () => {
      expect(screen.getByText('Covered')).toBeInTheDocument()
    })
  })

  describe('renders uncovered', () => {
    beforeEach(() => {
      setup(0)
    })

    it('uncovered', () => {
      expect(screen.getByText('Uncovered')).toBeInTheDocument()
    })
  })

  describe('renders partial', () => {
    beforeEach(() => {
      setup(2)
    })

    it('partial', () => {
      expect(screen.getByText('Partial')).toBeInTheDocument()
    })
  })
})
