import { render, screen } from '@testing-library/react'

import { LINE_TYPE } from 'shared/utils/fileviewerLines'

import DiffLine from './DiffLine'

// This is copypasted, needs some work
xdescribe('DiffLine', () => {
  const line = [
    { types: ['plain'], content: '      ' },
    { types: ['punctuation'], content: '...' },
    { types: ['plain'], content: 'treePaths' },
    { types: ['punctuation'], content: ',' },
    { types: ['plain'], content: '' },
  ]

  function setup(number, coverage, showLines) {
    render(
      <table>
        <tbody>
          <DiffLine
            line={line}
            number={number}
            coverage={coverage}
            showLines={showLines}
            getTokenProps={() => {}}
            getLineProps={() => {}}
          />
        </tbody>
      </table>
    )
  }

  describe('renders base line', () => {
    beforeEach(() => {
      const showLines = {
        showCovered: false,
        showUncovered: false,
        showPartial: true,
      }
      setup(1, null, showLines)
    })

    it('render base line', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(1)
    })
  })

  describe('renders highlighted covered line', () => {
    beforeEach(() => {
      const showLines = {
        showCovered: true,
        showUncovered: false,
        showPartial: false,
      }
      setup(1, LINE_TYPE.HIT, showLines)
    })

    it('render covered line', () => {
      expect(screen.getAllByLabelText('covered line of code').length).toBe(1)
    })
  })

  describe('renders base covered line', () => {
    beforeEach(() => {
      const showLines = {
        showCovered: false,
        showUncovered: false,
        showPartial: false,
      }
      setup(1, LINE_TYPE.HIT, showLines)
    })

    it('render covered line', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(1)
    })
  })

  describe('renders highlighted uncovered line', () => {
    beforeEach(() => {
      const showLines = {
        showCovered: false,
        showUncovered: true,
        showPartial: false,
      }
      setup(1, LINE_TYPE.MISS, showLines)
    })

    it('render uncovered line', () => {
      expect(screen.getAllByLabelText('uncovered line of code').length).toBe(1)
    })
  })

  describe('renders base uncovered line', () => {
    beforeEach(() => {
      const showLines = {
        showCovered: false,
        showUncovered: false,
        showPartial: false,
      }
      setup(1, LINE_TYPE.MISS, showLines)
    })

    it('render uncovered line', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(1)
    })
  })

  describe('renders highlighted partial line', () => {
    beforeEach(() => {
      const showLines = {
        showCovered: false,
        showUncovered: false,
        showPartial: true,
      }
      setup(2, LINE_TYPE.PARTIAL, showLines)
    })

    it('render partial line', () => {
      expect(screen.getAllByLabelText('partial line of code').length).toBe(1)
    })
  })

  describe('renders base partial line', () => {
    beforeEach(() => {
      const showLines = {
        showCovered: false,
        showUncovered: false,
        showPartial: false,
      }
      setup(1, LINE_TYPE.PARTIAL, showLines)
    })

    it('render partial line', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(1)
    })
  })
})
