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
    1: 1,
    2: 0,
    3: 1,
    4: 1,
    5: 0,
    6: 1,
    7: 0,
    8: 1,
    9: 1,
    10: 1,
    11: 0,
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
      expect(screen.getAllByLabelText('code-line').length).toBe(11)
    })
  })

  describe('renders with toggles', () => {
    beforeEach(() => {
      setup(code, coverage, true, true)
    })

    it('render', () => {
      expect(screen.getAllByLabelText('uncovered').length).toBe(4)
      expect(screen.getAllByLabelText('covered').length).toBe(7)
    })
  })

  describe('renders with default props', () => {
    beforeEach(() => {
      setup(code)
    })

    it('render', () => {
      expect(screen.getAllByLabelText('code-line').length).toBe(11)
    })
  })
})
