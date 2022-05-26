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

  function setup(props) {
    render(<CodeRenderer {...props} code={code} fileName="sample.py" />)
  }

  describe('Line Component', () => {
    beforeEach(() => {
      setup({
        LineComponent: ({ i }) => (
          <tr key={i}>
            <td>this is a random line test component {i + 1}</td>
          </tr>
        ),
      })
    })

    it('renders', () => {
      const lines = screen.getAllByText(/this is a random line test component/)
      expect(lines[0]).toBeInTheDocument()
    })
  })
})
