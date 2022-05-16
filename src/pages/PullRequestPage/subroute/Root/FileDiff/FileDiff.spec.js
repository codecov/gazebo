import { render, screen } from 'custom-testing-library'

import FileDiff from './FileDiff'

jest.mock(
  'ui/CodeRenderer/CodeRendererInfoRow',
  () => () => 'Unexpected Changes'
)

// TODO: Improve this test when we finalize props
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
        lineCoverageStatesAndSetters: {
          covered: true,
          uncovered: true,
          partial: true,
        },
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

  describe('when filename is null', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        segments: [
          {
            header: null,
            lines: [{ content: 'abc' }, { content: 'def' }],
          },
        ],
        lineCoverageStatesAndSetters: {
          covered: true,
          uncovered: true,
          partial: true,
        },
      })
    })
    it('renders unexpected changes', () => {
      expect(screen.getByText(/Unexpected Changes/i)).toBeInTheDocument()
    })
  })

  describe('when segment is an empty array', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        segments: [],
        lineCoverageStatesAndSetters: {
          covered: true,
          uncovered: true,
          partial: true,
        },
      })
    })
    it('doesnt render information on the code renderer', () => {
      expect(screen.queryByText(/Unexpected Changes/i)).not.toBeInTheDocument()
      expect(screen.queryByText('fv-diff-line')).not.toBeInTheDocument()
    })
  })
})
