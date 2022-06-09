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
    it('renders the lines of a segment', () => {
      expect(screen.getByText(/abc/)).toBeInTheDocument()
      expect(screen.getByText(/def/)).toBeInTheDocument()
    })
  })

  describe('when coverage has changed outside of the git diff', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        segments: [
          {
            hasUnintendedChanges: true,
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

  describe('a new file', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        isNewFile: true,
        segments: [],
        lineCoverageStatesAndSetters: {
          covered: true,
          uncovered: true,
          partial: true,
        },
      })
    })
    it('renders a new file label', () => {
      expect(screen.getByText(/New/i)).toBeInTheDocument()
    })
  })

  describe('a renamed file', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        isRenamedFile: true,
        segments: [],
        lineCoverageStatesAndSetters: {
          covered: true,
          uncovered: true,
          partial: true,
        },
      })
    })
    it('renders a renamed file label', () => {
      expect(screen.getByText(/Renamed/i)).toBeInTheDocument()
    })
  })

  describe('a deleted file', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        isDeletedFile: true,
        segments: [],
        lineCoverageStatesAndSetters: {
          covered: true,
          uncovered: true,
          partial: true,
        },
      })
    })
    it('renders a deleted file label', () => {
      expect(screen.getByText(/Deleted/i)).toBeInTheDocument()
    })
  })

  describe('a critical file', () => {
    beforeEach(() => {
      setup({
        headName: 'main.ts',
        isNewFile: true,
        isCriticalFile: true,
        segments: [],
        lineCoverageStatesAndSetters: {
          covered: true,
          uncovered: true,
          partial: true,
        },
      })
    })
    it('renders a critical file label', () => {
      expect(screen.getByText(/Critical File/i)).toBeInTheDocument()
    })
  })
})
