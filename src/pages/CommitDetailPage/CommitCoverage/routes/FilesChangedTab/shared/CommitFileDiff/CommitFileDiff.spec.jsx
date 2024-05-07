import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useScrollToLine } from 'ui/CodeRenderer/hooks/useScrollToLine'

import CommitFileDiff from './CommitFileDiff'

jest.mock('ui/CodeRenderer/hooks/useScrollToLine')

const baseMock = (impactedFile) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'Comparison',
          impactedFile: {
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
  isNewFile: false,
  isRenamedFile: false,
  isDeletedFile: false,
  baseCoverage: {
    coverage: 100,
  },
  headCoverage: {
    coverage: 100,
  },
  patchCoverage: {
    coverage: 100,
  },
  changeCoverage: 0,
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
              hitCount: 5,
              hitUploadIds: [1, 2, 3, 4, 5],
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
          {
            baseNumber: null,
            headNumber: '4',
            baseCoverage: null,
            headCoverage: 'H',
            content: '# cool python comment',
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

const mockOverview = (bundleAnalysisEnabled = false) => {
  return {
    owner: {
      repository: {
        __typename: 'Repository',
        private: false,
        defaultBranch: 'main',
        oldestCommitAt: '2022-10-10T11:59:59',
        coverageEnabled: true,
        bundleAnalysisEnabled,
        languages: ['javascript'],
      },
    },
  }
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

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

describe('CommitFileDiff', () => {
  function setup(
    { impactedFile = mockImpactedFile, bundleAnalysisEnabled = false } = {
      impactedFile: mockImpactedFile,
      bundleAnalysisEnabled: false,
    }
  ) {
    useScrollToLine.mockImplementation(() => ({
      lineRef: () => {},
      handleClick: jest.fn(),
      targeted: false,
    }))

    server.use(
      graphql.query('ImpactedFileComparedWithParent', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(baseMock(impactedFile)))
      ),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(mockOverview(bundleAnalysisEnabled))
        )
      })
    )
  }

  describe('when rendered', () => {
    it('renders the line changes header', async () => {
      setup()
      render(<CommitFileDiff path={'flag1/file.js'} />, { wrapper })

      const changeHeader = await screen.findByText('-0,0 +1,45')
      expect(changeHeader).toBeInTheDocument()
    })

    it('renders the lines of a segment', async () => {
      setup()
      render(<CommitFileDiff path={'flag1/file.js'} />, { wrapper })

      const calculator = await screen.findByText(/Calculator/)
      expect(calculator).toBeInTheDocument()

      const value = await screen.findByText(/value/)
      expect(value).toBeInTheDocument()

      const calcMode = await screen.findByText(/calcMode/)
      expect(calcMode).toBeInTheDocument()
    })

    it('renders hit count icon', async () => {
      setup()
      render(<CommitFileDiff path={'flag1/file.js'} />, { wrapper })

      const hitCount = await screen.findByText('5')
      expect(hitCount).toBeInTheDocument()
    })

    describe('only coverage is enabled', () => {
      it('renders the commit redirect url', async () => {
        setup()
        render(<CommitFileDiff path={'flag1/file.js'} />, { wrapper })

        const viewFullFileText = await screen.findByText(/View full file/)
        expect(viewFullFileText).toBeInTheDocument()
        expect(viewFullFileText).toHaveAttribute(
          'href',
          '/gh/codecov/gazebo/commit/123sha/blob/flag1/file.js'
        )
      })
    })

    describe('both coverage and bundle products are enabled', () => {
      it('renders the commit redirect url with query string', async () => {
        setup({ bundleAnalysisEnabled: true })
        render(<CommitFileDiff path={'flag1/file.js'} />, { wrapper })

        const viewFullFileText = await screen.findByText(/View full file/)
        expect(viewFullFileText).toBeInTheDocument()
        expect(viewFullFileText).toHaveAttribute(
          'href',
          '/gh/codecov/gazebo/commit/123sha/blob/flag1/file.js?dropdown=coverage'
        )
      })
    })
  })

  describe('when segment is an empty array', () => {
    beforeEach(() => {
      const impactedFile = {
        ...mockImpactedFile,
        isCriticalFile: false,
        headName: 'flag1/file.js',
        segments: [],
      }

      setup({ impactedFile })
    })
    it('does not render information on the code renderer', async () => {
      render(<CommitFileDiff path={'flag1/file.js'} />, { wrapper })

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
        ...mockImpactedFile,
        isCriticalFile: false,
        isNewFile: true,
      }
      setup({ impactedFile })
    })

    it('renders a new file label', async () => {
      render(<CommitFileDiff path={'flag1/file.js'} />, { wrapper })

      const newText = await screen.findByText(/New/i)
      expect(newText).toBeInTheDocument()
    })
  })

  describe('a renamed file', () => {
    beforeEach(() => {
      const impactedFile = {
        ...mockImpactedFile,
        isRenamedFile: true,
      }
      setup({ impactedFile })
    })
    it('renders a renamed file label', async () => {
      render(<CommitFileDiff path={'flag1/file.js'} />, { wrapper })

      const renamed = await screen.findByText(/Renamed/i)
      expect(renamed).toBeInTheDocument()
    })
  })

  describe('a deleted file', () => {
    beforeEach(() => {
      const impactedFile = {
        ...mockImpactedFile,
        isDeletedFile: true,
      }
      setup({ impactedFile })
    })
    it('renders a deleted file label', async () => {
      render(<CommitFileDiff path={'flag1/file.js'} />, { wrapper })

      const deleted = await screen.findByText(/Deleted/i)
      expect(deleted).toBeInTheDocument()
    })
  })

  describe('a critical file', () => {
    beforeEach(() => {
      const impactedFile = {
        ...mockImpactedFile,
        isCriticalFile: true,
      }
      setup({ impactedFile })
    })
    it('renders a critical file label', async () => {
      render(<CommitFileDiff path={'flag1/file.js'} />, { wrapper })

      const criticalFile = await screen.findByText(/Critical File/i)
      expect(criticalFile).toBeInTheDocument()
    })
  })

  describe('when there is no data', () => {
    beforeEach(() => {
      setup({ impactedFile: null })
    })
    it('renders a error display message', async () => {
      render(<CommitFileDiff path={'random/path'} />, { wrapper })

      const criticalFile = await screen.findByText(
        /There was a problem getting the source code from your provider. Unable to show line by line coverage/i
      )
      expect(criticalFile).toBeInTheDocument()
    })
  })
})
