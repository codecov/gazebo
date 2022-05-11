import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCommitBasedCoverageForFileViewer } from 'services/file'

import CommitFileView from './CommitFileView'

jest.mock(
  'ui/FileViewer/ToggleHeader/ToggleHeader',
  () => () => 'The FileViewer Toggle Header'
)
jest.mock(
  'ui/CodeRenderer/CodeRendererProgressHeader',
  () => () => 'The Progress Header for Coderenderer'
)
jest.mock('services/file')

const queryClient = new QueryClient()

const diff = {
  headCoverage: { coverage: 40.23 },
  baseCoverage: { coverage: 14.12 },
}

describe('CommitFileView', () => {
  function setup(props) {
    const { content, coverage } = props

    useCommitBasedCoverageForFileViewer.mockReturnValue({
      isLoading: false,
      totals: 53.43,
      coverage,
      flagNames: ['flagOne', 'flagTwo'],
      content,
    })

    render(
      <MemoryRouter
        initialEntries={[
          '/gh/codecov/gazebo/commit/123sha/folder/subfolder/file.js',
        ]}
      >
        <Route path="/:provider/:owner/:repo/commit/:commit/:path">
          <QueryClientProvider client={queryClient}>
            <CommitFileView diff={diff} />
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('when there is content to be shown', () => {
    afterEach(() => jest.clearAllMocks())
    beforeEach(() => {
      setup({
        content:
          'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};',
        coverage: {
          1: 'H',
          2: 'H',
          5: 'H',
          6: 'H',
          9: 'H',
          10: 'H',
          13: 'M',
          14: 'P',
          15: 'M',
          16: 'M',
          17: 'M',
          21: 'H',
        },
      })
    })

    it('renders the FileViewer Header, Coderenderer Header, and Coderenderer', () => {
      expect(
        screen.getByText(/The FileViewer Toggle Header/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/The Progress Header for Coderenderer/)
      ).toBeInTheDocument()
      expect(
        screen.queryByText(
          /There was a problem getting the source code from your provider./
        )
      ).not.toBeInTheDocument()

      const allTestIds = screen.getAllByTestId('fv-single-line')
      expect(allTestIds.length).toEqual(21)
    })
  })

  describe('when there is no content to be shown', () => {
    beforeEach(() => {
      setup({
        content: null,
        coverage: {
          1: 'H',
          2: 'H',
          5: 'H',
          6: 'H',
          9: 'H',
          10: 'H',
          13: 'M',
          14: 'P',
          15: 'M',
          16: 'M',
          17: 'M',
          21: 'H',
        },
      })
    })

    it('renders the FileViewer Header, Coderenderer Header, and error message', () => {
      expect(
        screen.getByText(/The FileViewer Toggle Header/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/The Progress Header for Coderenderer/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /There was a problem getting the source code from your provider./
        )
      ).toBeInTheDocument()
    })
  })
})
