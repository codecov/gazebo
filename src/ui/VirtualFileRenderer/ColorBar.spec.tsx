import { render, screen } from '@testing-library/react'

import { ColorBar } from './ColorBar'

describe('ColorBar', () => {
  describe('when there is no coverage data', () => {
    it('does not render', () => {
      const { container } = render(
        <ColorBar coverage={undefined} locationHash="" lineNumber={0} />
      )
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('coverage value is H', () => {
    it('renders with covered color', () => {
      render(<ColorBar coverage={'H'} locationHash="" lineNumber={0} />)

      const bar = screen.getByTestId('covered-bar')
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveClass('bg-ds-coverage-covered')
    })
  })

  describe('coverage value is M', () => {
    it('renders with uncovered color', () => {
      render(<ColorBar coverage={'M'} locationHash="" lineNumber={0} />)

      const bar = screen.getByTestId('uncovered-bar')
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveClass('bg-ds-coverage-uncovered')
    })
  })

  describe('coverage value is P', () => {
    it('renders with partial color', () => {
      render(<ColorBar coverage={'P'} locationHash="" lineNumber={0} />)

      const bar = screen.getByTestId('partial-bar')
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveClass('bg-ds-coverage-partial')
    })
  })

  describe('highlighted line', () => {
    it('renders with highlighted color', () => {
      render(<ColorBar coverage={'P'} locationHash="#L18" lineNumber={18} />)

      const bar = screen.getByTestId('highlighted-bar')
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveClass('bg-ds-blue-medium')
    })
  })
})
