import { render, screen } from '@testing-library/react'
import Line from './Line'
import { LINE_TYPE } from './lineStates'

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
      <table>
        <tbody>
          <Line
            showCovered={showCovered}
            line={line}
            showUncovered={showUncovered}
            number={number}
            coverage={coverage}
            showPartial={true}
            getTokenProps={() => {}}
            getLineProps={() => {}}
          />
        </tbody>
      </table>
    )
  }

  describe('renders base line', () => {
    beforeEach(() => {
      setup(1, null, false, false)
    })

    it('render base line', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(1)
    })
  })

  describe('renders highlighted covered line', () => {
    beforeEach(() => {
      setup(1, LINE_TYPE.HIT, true, false)
    })

    it('render covered line', () => {
      expect(screen.getAllByLabelText('covered line of code').length).toBe(1)
    })
  })

  describe('renders base covered line', () => {
    beforeEach(() => {
      setup(1, LINE_TYPE.HIT, false, false)
    })

    it('render covered line', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(1)
    })
  })

  describe('renders highlighted uncovered line', () => {
    beforeEach(() => {
      setup(1, LINE_TYPE.MISS, true, true)
    })

    it('render uncovered line', () => {
      expect(screen.getAllByLabelText('uncovered line of code').length).toBe(1)
    })
  })

  describe('renders base uncovered line', () => {
    beforeEach(() => {
      setup(1, LINE_TYPE.MISS, false, false)
    })

    it('render uncovered line', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(1)
    })
  })

  describe('renders highlighted partial line', () => {
    beforeEach(() => {
      setup(2, LINE_TYPE.PARTIAL, true, true)
    })

    it('render partial line', () => {
      expect(screen.getAllByLabelText('partial line of code').length).toBe(1)
    })
  })
})
