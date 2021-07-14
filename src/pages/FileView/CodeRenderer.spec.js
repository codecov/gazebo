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

  const coverage = [
    {
      coverage: {
        base: null,
        head: null,
      },
    },
    {
      coverage: {
        base: 1,
        head: 1,
      },
    },
    {
      coverage: {
        base: 1,
        head: 1,
      },
    },
    {
      coverage: {
        base: 0,
        head: 0,
      },
    },
    {
      coverage: {
        base: 0,
        head: 0,
      },
    },
    {
      coverage: {
        base: 1,
        head: 1,
      },
    },
    {
      coverage: {
        base: 1,
        head: 1,
      },
    },
  ]

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
      expect(screen.getAllByLabelText('covered').length).toBe(2)
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
