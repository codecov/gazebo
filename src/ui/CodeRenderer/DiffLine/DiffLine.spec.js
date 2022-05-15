import { render, screen } from '@testing-library/react'

import { LINE_TYPE } from 'shared/utils/fileviewer'

import DiffLine from './DiffLine'

describe('DiffLine', () => {
  const lineContent = [
    { types: ['plain'], content: '      ' },
    { types: ['punctuation'], content: '...' },
    { types: ['plain'], content: 'treePaths' },
    { types: ['punctuation'], content: ',' },
    { types: ['plain'], content: '' },
  ]

  function setup(props) {
    render(
      <table>
        <tbody>
          <DiffLine
            {...props}
            lineContent={lineContent}
            getTokenProps={() => {}}
            getLineProps={() => {}}
          />
        </tbody>
      </table>
    )
  }

  describe('renders base lines', () => {
    const props = {
      edgeOfFile: false,
      showLines: {
        showCovered: true,
        showUncovered: true,
        showPartial: true,
      },
      headNumber: '1',
      baseNumber: '1',
      headCoverage: null,
      baseCoverage: null,
    }

    it('when coverage is null', () => {
      setup(props)
      expect(screen.getAllByLabelText('line of code').length).toBe(2)
    })
  })

  describe('renders highlighted covered lines', () => {
    beforeEach(() => {
      const props = {
        edgeOfFile: false,
        showLines: {
          showCovered: true,
          showUncovered: true,
          showPartial: true,
        },
        headNumber: '1',
        baseNumber: '1',
        headCoverage: 'H',
        baseCoverage: 'H',
      }
      setup(props)
    })

    it('render covered lines if there is coverage and showCoverage is true', () => {
      expect(screen.getAllByLabelText('covered line of code').length).toBe(2)
    })
  })

  describe('renders highlighted covered line for head', () => {
    beforeEach(() => {
      const props = {
        edgeOfFile: false,
        showLines: {
          showCovered: true,
          showUncovered: true,
          showPartial: true,
        },
        headNumber: '1',
        baseNumber: '1',
        headCoverage: 'H',
        baseCoverage: null,
      }
      setup(props)
    })

    it('render covered lines if there is coverage and showCoverage is true', () => {
      expect(screen.getAllByLabelText('covered line of code').length).toBe(1)
    })
  })

  describe('renders highlighted uncovered lines', () => {
    beforeEach(() => {
      const props = {
        edgeOfFile: false,
        showLines: {
          showCovered: true,
          showUncovered: true,
          showPartial: true,
        },
        headNumber: '1',
        baseNumber: '1',
        headCoverage: 'M',
        baseCoverage: 'M',
      }
      setup(props)
    })

    it('render uncovered line', () => {
      expect(screen.getAllByLabelText('uncovered line of code').length).toBe(2)
    })
  })

  describe('renders highlighted uncovered base', () => {
    beforeEach(() => {
      const props = {
        edgeOfFile: false,
        showLines: {
          showCovered: true,
          showUncovered: true,
          showPartial: true,
        },
        headNumber: '1',
        baseNumber: '1',
        headCoverage: null,
        baseCoverage: 'M',
      }
      setup(props)
    })

    it('render uncovered line', () => {
      expect(screen.getAllByLabelText('uncovered line of code').length).toBe(1)
    })
  })

  describe('renders highlighted partial lines', () => {
    beforeEach(() => {
      const props = {
        edgeOfFile: false,
        showLines: {
          showCovered: true,
          showUncovered: true,
          showPartial: true,
        },
        headNumber: '1',
        baseNumber: '1',
        headCoverage: 'P',
        baseCoverage: 'P',
      }
      setup(props)
    })

    it('render partial lines', () => {
      expect(screen.getAllByLabelText('partial line of code').length).toBe(2)
    })
  })

  describe('renders highlighted partial head', () => {
    beforeEach(() => {
      const props = {
        edgeOfFile: true,
        showLines: {
          showCovered: true,
          showUncovered: true,
          showPartial: true,
        },
        headNumber: '1',
        baseNumber: '1',
        headCoverage: 'P',
        baseCoverage: null,
      }
      setup(props)
    })

    it('render partial line', () => {
      expect(screen.getAllByLabelText('partial line of code').length).toBe(1)
    })
  })
})
