import { render, screen } from '@testing-library/react'
import Line from './Line'

describe('Line', () => {
  const line = [
    { types: ['plain'], content: '      ' },
    { types: ['punctuation'], content: '...' },
    { types: ['plain'], content: 'treePaths' },
    { types: ['punctuation'], content: ',' },
    { types: ['plain'], content: '' },
  ]

  function setup(number, coverage, showCovered, showUncovered) {
    render(
      <Line
        showCovered={showCovered}
        line={line}
        showUncovered={showUncovered}
        number={number}
        coverage={coverage}
        getTokenProps={() => {}}
        getLineProps={() => {}}
      />
    )
  }

  describe('renders base line', () => {
    beforeEach(() => {
      setup(1, null, false, false)
    })

    it('render base line', () => {
      expect(screen.getAllByLabelText('code-line').length).toBe(1)
    })
  })

  describe('renders highlighted covered line', () => {
    beforeEach(() => {
      setup(1, 1, true, false)
    })

    it('render covered line', () => {
      expect(screen.getAllByLabelText('covered').length).toBe(1)
    })
  })

  describe('renders base covered line', () => {
    beforeEach(() => {
      setup(1, 1, false, false)
    })

    it('render covered line', () => {
      expect(screen.getAllByLabelText('code-line').length).toBe(1)
    })
  })

  describe('renders highlighted uncovered line', () => {
    beforeEach(() => {
      setup(1, 0, true, true)
    })

    it('render uncovered line', () => {
      expect(screen.getAllByLabelText('uncovered').length).toBe(1)
    })
  })

  describe('renders base uncovered line', () => {
    beforeEach(() => {
      setup(1, 0, false, false)
    })

    it('render uncovered line', () => {
      expect(screen.getAllByLabelText('code-line').length).toBe(1)
    })
  })
})
