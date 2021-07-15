import { render, screen } from '@testing-library/react'
import CoverageSelect from './CoverageSelect'

const onChange = jest.fn(() => {})

describe('CoverageSelect', () => {
  function setup(covered) {
    render(
      <CoverageSelect covered={covered} checked={false} onChange={onChange} />
    )
  }

  describe('renders covered', () => {
    beforeEach(() => {
      setup(true)
    })

    it('covered', () => {
      expect(screen.getByText('Covered')).toBeInTheDocument()
    })
  })

  describe('renders uncovered', () => {
    beforeEach(() => {
      setup(true)
    })

    it('uncovered', () => {
      expect(screen.getByText('Covered')).toBeInTheDocument()
    })
  })
})
