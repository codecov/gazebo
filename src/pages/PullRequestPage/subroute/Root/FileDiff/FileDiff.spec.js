import { render, screen } from 'custom-testing-library'

import FileDiff from './FileDiff'

describe('FileDiff', () => {
  function setup(props) {
    render(<FileDiff {...props} />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        segments: [
          {
            header: '@@ -1 +3 @@',
            lines: [{ content: 'abc' }, { content: 'def' }],
          },
        ],
      })
    })
    it('renders the name of a impacted file', () => {
      expect(screen.getByText(/main.ts/i)).toBeInTheDocument()
    })
    it('renders the patch of a segment', () => {
      expect(screen.getByText('@@ -1 +3 @@')).toBeInTheDocument()
    })
    it('renders the lines of a segment', () => {
      expect(screen.getByText(/abc/)).toBeInTheDocument()
      expect(screen.getByText(/def/)).toBeInTheDocument()
    })
  })
})
