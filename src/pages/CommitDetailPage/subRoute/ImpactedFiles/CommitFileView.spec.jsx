import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useScrollToLine } from 'ui/CodeRenderer/hooks/useScrollToLine'

import CommitFileView from './CommitFileView'

jest.mock('ui/CodeRenderer/hooks/useScrollToLine')

const diff = {
  headCoverage: { coverage: 40.23 },
  baseCoverage: { coverage: 14.12 },
  compareWithParent: {
    impactedFiles: [],
  },
}

const mockCoverage = (content) => ({
  repository: {
    commit: {
      commitId: '123',
      flagNames: ['flagOne', 'flagTwo'],
      coverageFile: {
        hashedPath: 'hashedPath123',
        content,
        coverage: [
          { line: 1, coverage: 'H' },
          { line: 2, coverage: 'H' },
          { line: 5, coverage: 'H' },
          { line: 6, coverage: 'H' },
          { line: 9, coverage: 'H' },
          { line: 10, coverage: 'H' },
          { line: 13, coverage: 'M' },
          { line: 14, coverage: 'P' },
          { line: 15, coverage: 'M' },
          { line: 16, coverage: 'M' },
          { line: 17, coverage: 'M' },
          { line: 21, coverage: 'H' },
        ],
        totals: {
          coverage: 53.43,
        },
      },
    },
  },
})

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={[
        '/gh/codecov/gazebo/commit/123sha/folder/subfolder/file.js',
      ]}
    >
      <Route path="/:provider/:owner/:repo/commit/:commit">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('CommitFileView', () => {
  function setup({ content }) {
    useScrollToLine.mockImplementation(() => ({
      lineRef: () => {},
      handleClick: jest.fn(),
      targeted: false,
    }))

    server.use(
      graphql.query('CoverageForFile', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: mockCoverage(content) }))
      )
    )
  }

  describe('when there is content to be shown', () => {
    afterEach(() => jest.clearAllMocks())
    beforeEach(() => {
      setup({
        content:
          'function add(a, b) {\n    return a + b;\n}\n\nfunction subtract(a, b) {\n    return a - b;\n}\n\nfunction multiply(a, b) {\n    return a * b;\n}\n\nfunction divide(a, b) {\n    if (b !== 0) {\n        return a / b;\n    } else {\n        return 0\n    }\n}\n\nmodule.exports = {add, subtract, multiply, divide};',
      })
    })

    it('does not render the error message', async () => {
      render(<CommitFileView diff={diff} path="api/core/commit/123" />, {
        wrapper,
      })

      const allTestIds = await screen.findAllByTestId('fv-single-line')
      expect(allTestIds.length).toEqual(21)
    })
  })

  describe('when there is no content to be shown', () => {
    beforeEach(() => {
      setup({
        content: null,
      })
    })

    it('renders error message', async () => {
      render(<CommitFileView diff={diff} path="api/core/commit/123" />, {
        wrapper,
      })

      const errorMessage = await screen.findByText(/problem/)
      expect(errorMessage).toBeInTheDocument()
    })
  })
})
