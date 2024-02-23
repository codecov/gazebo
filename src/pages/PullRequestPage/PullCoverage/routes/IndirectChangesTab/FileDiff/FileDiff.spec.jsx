import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useScrollToLine } from 'ui/CodeRenderer/hooks/useScrollToLine'

import FileDiff from './FileDiff'

jest.mock('ui/CodeRenderer/hooks/useScrollToLine')

const baseMock = (impactedFile) => ({
  owner: {
    repository: {
      pull: {
        compareWithBase: {
          impactedFile: {
            ...mockImpactedFile,
            ...impactedFile,
          },
        },
      },
    },
  },
})

const mockImpactedFile = {
  isCriticalFile: false,
  headName: 'flag1/file.js',
  hashedPath: 'hashedFilePath',
  segments: {
    results: [
      {
        header: '-0,0 +1,45',
        hasUnintendedChanges: false,
        lines: [
          {
            baseNumber: null,
            headNumber: '1',
            baseCoverage: null,
            headCoverage: 'H',
            content: '+export default class Calculator {',
            coverageInfo: {
              hitCount: null,
              hitUploadIds: null,
            },
          },
          {
            baseNumber: null,
            headNumber: '2',
            baseCoverage: null,
            headCoverage: 'H',
            content: '+  private value = 0;',
            coverageInfo: {
              hitCount: 18,
              hitUploadIds: [0],
            },
          },
          {
            baseNumber: null,
            headNumber: '3',
            baseCoverage: null,
            headCoverage: 'H',
            content: '+  private calcMode = ""',
            coverageInfo: {
              hitCount: null,
              hitUploadIds: null,
            },
          },
        ],
      },
    ],
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/pull/1']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('FileDiff', () => {
  function setup({ impactedFile } = { impactedFile: mockImpactedFile }) {
    useScrollToLine.mockImplementation(() => ({
      lineRef: () => {},
      handleClick: jest.fn(),
      targeted: false,
    }))

    server.use(
      graphql.query('ImpactedFileComparison', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(baseMock(impactedFile)))
      )
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the line changes header', async () => {
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const changeHeader = await screen.findByText('-0,0 +1,45')
      expect(changeHeader).toBeInTheDocument()
    })

    it('renders the lines of a segment', async () => {
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const calculator = await screen.findByText(/Calculator/)
      expect(calculator).toBeInTheDocument()

      const value = await screen.findByText(/value/)
      expect(value).toBeInTheDocument()

      const calcMode = await screen.findByText(/calcMode/)
      expect(calcMode).toBeInTheDocument()
    })

    it('renders hit counter', async () => {
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const hitCounter = await screen.findByText('18')
      expect(hitCounter).toBeInTheDocument()
    })

    it('renders the commit redirect url', async () => {
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const viewFullFileText = await screen.findByText(/View full file/)
      expect(viewFullFileText).toBeInTheDocument()
      expect(viewFullFileText).toHaveAttribute(
        'href',
        '/gh/codecov/cool-repo/pull/1/blob/flag1/file.js'
      )
    })
  })

  describe('when segment is an empty array', () => {
    beforeEach(() => {
      const impactedFile = {
        isCriticalFile: false,
        headName: 'flag1/file.js',
        segments: [],
      }

      setup({ impactedFile })
    })
    it('does not render information on the code renderer', async () => {
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const unexpectedChange = screen.queryByText(/Unexpected Changes/i)
      expect(unexpectedChange).not.toBeInTheDocument()

      const diffLine = screen.queryByText('fv-diff-line')
      expect(diffLine).not.toBeInTheDocument()
    })
  })

  describe('a new file', () => {
    beforeEach(() => {
      const impactedFile = {
        isCriticalFile: false,
        isNewFile: true,
        headName: 'flag1/file.js',
        segments: {
          results: [{ lines: [{ content: 'abc' }, { content: 'def' }] }],
        },
      }
      setup({ impactedFile })
    })

    it('renders a new file label', async () => {
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const newText = await screen.findByText(/New/i)
      expect(newText).toBeInTheDocument()
    })
  })

  describe('a renamed file', () => {
    beforeEach(() => {
      const impactedFile = {
        isCriticalFile: false,
        isRenamedFile: true,
        headName: 'flag1/file.js',
        segments: {
          results: [{ lines: [{ content: 'abc' }, { content: 'def' }] }],
        },
      }
      setup({ impactedFile })
    })
    it('renders a renamed file label', async () => {
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const renamed = await screen.findByText(/Renamed/i)
      expect(renamed).toBeInTheDocument()
    })
  })

  describe('a deleted file', () => {
    beforeEach(() => {
      const impactedFile = {
        isCriticalFile: false,
        isDeletedFile: true,
        headName: 'flag1/file.js',
        segments: {
          results: [{ lines: [{ content: 'abc' }, { content: 'def' }] }],
        },
      }
      setup({ impactedFile })
    })
    it('renders a deleted file label', async () => {
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const deleted = await screen.findByText(/Deleted/i)
      expect(deleted).toBeInTheDocument()
    })
  })

  describe('a critical file', () => {
    beforeEach(() => {
      const impactedFile = {
        isCriticalFile: true,
        fileLabel: null,
        headName: 'flag1/file.js',
        segments: {
          results: [{ lines: [{ content: 'abc' }, { content: 'def' }] }],
        },
      }
      setup({ impactedFile })
    })
    it('renders a critical file label', async () => {
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const criticalFile = await screen.findByText(/Critical File/i)
      expect(criticalFile).toBeInTheDocument()
    })
  })
})
