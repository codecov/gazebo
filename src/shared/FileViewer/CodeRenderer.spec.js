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
    3: LINE_TYPE.HIT,
    4: LINE_TYPE.HIT,
    5: LINE_TYPE.MISS,
    6: LINE_TYPE.HIT,
    7: LINE_TYPE.MISS,
    8: LINE_TYPE.HIT,
    9: LINE_TYPE.HIT,
    10: LINE_TYPE.HIT,
    11: LINE_TYPE.MISS,
  }

  function setup(props) {
    render(<CodeRenderer {...props} fileName="sample.py" />)
  }

  describe('renders without toggles', () => {
    beforeEach(() => {
      setup({ code, coverage, showCovered: false, showUncovered: false })
    })

    it('render', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(11)
    })
  })

  describe('renders with toggles', () => {
    beforeEach(() => {
      setup({ code, coverage, showCovered: true, showUncovered: true })
    })

    it('render', () => {
      expect(screen.getAllByLabelText('uncovered line of code').length).toBe(4)
      expect(screen.getAllByLabelText('covered line of code').length).toBe(7)
    })
  })

  describe('renders with default props', () => {
    beforeEach(() => {
      setup({ code, coverage, showCovered: false, showUncovered: false })
    })

    it('render', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(11)
    })
  })
})
