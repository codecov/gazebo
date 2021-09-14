import { render, screen } from '@testing-library/react'
import CodeRenderer from './CodeRenderer'

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
    1: 0,
    2: 1,
    3: 0,
    4: 0,
    5: 1,
    6: 0,
    7: 1,
    8: 0,
    9: 0,
    10: 0,
    11: 1,
  }

  function setup(code, coverage, showCovered, showUncovered) {
    render(
      <CodeRenderer
        showCovered={showCovered}
        showUncovered={showUncovered}
        code={code}
        coverage={coverage}
      />
    )
  }

  describe('renders without toggles', () => {
    beforeEach(() => {
      setup(code, coverage, false, false)
    })

    it('render', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(11)
    })
  })

  describe('renders with toggles', () => {
    beforeEach(() => {
      setup(code, coverage, true, true)
    })

    it('render', () => {
      expect(screen.getAllByLabelText('uncovered line of code').length).toBe(4)
      expect(screen.getAllByLabelText('covered line of code').length).toBe(7)
    })
  })

  describe('renders with default props', () => {
    beforeEach(() => {
      setup(code)
    })

    it('render', () => {
      expect(screen.getAllByLabelText('line of code').length).toBe(11)
    })
  })
})
