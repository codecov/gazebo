import * as Sentry from '@sentry/react'
import { render, screen } from '@testing-library/react'

import { ColorBar, findCoverage } from './ColorBar'

const mocks = vi.hoisted(() => ({
  captureMessage: vi.fn(),
}))

vi.mock('@sentry/react', async () => {
  const originalModule = vi.importActual('@sentry/react')
  return {
    ...originalModule,
    captureMessage: mocks.captureMessage,
  }
})

describe('ColorBar', () => {
  describe('when there is no coverage data', () => {
    it('does not render', () => {
      const { container } = render(
        <ColorBar coverage={undefined} isHighlighted={false} />
      )
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('coverage value is H', () => {
    it('renders with covered color', () => {
      render(<ColorBar coverage={'H'} isHighlighted={false} />)

      const bar = screen.getByTestId('covered-bar')
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveClass('bg-ds-coverage-covered/50')
    })
  })

  describe('coverage value is M', () => {
    it('renders with uncovered color', () => {
      render(<ColorBar coverage={'M'} isHighlighted={false} />)

      const bar = screen.getByTestId('uncovered-bar')
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveClass('bg-ds-coverage-uncovered/75')
    })
  })

  describe('coverage value is P', () => {
    it('renders with partial color', () => {
      render(<ColorBar coverage={'P'} isHighlighted={false} />)

      const bar = screen.getByTestId('partial-bar')
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveClass('bg-ds-coverage-partial/50')
    })
  })

  describe('highlighted line', () => {
    it('renders with highlighted color', () => {
      render(<ColorBar coverage={'P'} isHighlighted={true} />)

      const bar = screen.getByTestId('highlighted-bar')
      expect(bar).toBeInTheDocument()
      expect(bar).toHaveClass('bg-ds-blue-medium/25')
    })
  })

  describe('invalid coverage value', () => {
    it('renders empty body', () => {
      const { container } = render(
        // @ts-expect-error - testing invalid value
        <ColorBar coverage={'X'} isHighlighted={false} />
      )
      expect(container).toBeEmptyDOMElement()
    })
  })
})

describe('findCoverage', () => {
  const testCases = [
    { type: 'H', expected: 'H' },
    { type: 'M', expected: 'M' },
    { type: 'P', expected: 'P' },
    { type: undefined, expected: undefined },
  ] as const

  it.each(testCases)(
    'returns `$expected` when coverage type is `$type`',
    ({ expected, type }) => {
      expect(findCoverage(type)).toBe(expected)
    }
  )

  it('captures an error via Sentry when the coverage type is invalid', () => {
    // @ts-expect-error - testing invalid type
    findCoverage('X')
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Invalid coverage value: X'
    )
  })
})
