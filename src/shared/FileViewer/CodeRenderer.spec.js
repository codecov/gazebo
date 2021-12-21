import { render, screen } from '@testing-library/react'
import CodeRenderer from './CodeRenderer'
import { LINE_TYPE } from './lineStates'

describe('CodeRenderer', () => {
  const code = `
  <Breadcrumb
      paths={[
      { pageName: 'owner', text: owner },
      { pageName: 'repo', text: repo },
      ...treePaths,
      {..props}
      ]}
  />

  `

  const coverage = {
    1: LINE_TYPE.HIT,
    2: LINE_TYPE.MISS,
    3: LINE_TYPE.PARTIAL,
    4: LINE_TYPE.PARTIAL,
    5: LINE_TYPE.MISS,
    6: LINE_TYPE.HIT,
    7: LINE_TYPE.MISS,
    8: LINE_TYPE.HIT,
    9: LINE_TYPE.HIT,
    10: LINE_TYPE.HIT,
    11: LINE_TYPE.MISS,
  }

  function setup(props) {
    render(<CodeRenderer {...props} code={code} fileName="sample.py" />)
  }

  describe('partial coverage', () => {
    beforeEach(() => {
      setup({
        coverage,
        showCovered: false,
        showUncovered: false,
        showPartial: true,
      })
    })

    it('renders', () => {
      expect(screen.getAllByLabelText('partial line of code').length).toBe(2)
    })
  })

  describe('coverage', () => {
    beforeEach(() => {
      setup({
        coverage,
        showCovered: true,
        showUncovered: false,
        showPartial: false,
      })
    })

    it('renders', () => {
      expect(screen.getAllByLabelText('covered line of code').length).toBe(5)
    })
  })

  describe('uncovered coverage', () => {
    beforeEach(() => {
      setup({
        coverage,
        showCovered: false,
        showUncovered: true,
        showPartial: false,
      })
    })

    it('renders', () => {
      expect(screen.getAllByLabelText('uncovered line of code').length).toBe(4)
    })
  })

  describe('with default props', () => {
    beforeEach(() => {
      setup({
        coverage,
        showCovered: false,
        showUncovered: false,
        showPartial: false,
      })
    })

    it('renders', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(11)
    })
  })

  describe('No coverage availble', () => {
    beforeEach(() => {
      setup({
        coverage: {},
        showCovered: false,
        showUncovered: false,
        showPartial: false,
      })
    })

    it('renders', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(11)
    })
  })

  describe('Using  defaults', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(11)
    })
  })
})
