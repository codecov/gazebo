import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import FileDiff from './FileDiff'

const mocks = vi.hoisted(() => ({
  useScrollToLine: vi.fn(),
}))

vi.mock('ui/CodeRenderer/hooks/useScrollToLine', async () => {
  const actual = await vi.importActual('ui/CodeRenderer/hooks/useScrollToLine')
  return {
    ...actual,
    useScrollToLine: mocks.useScrollToLine,
  }
})
window.requestAnimationFrame = (cb) => cb()
window.cancelAnimationFrame = () => {}

const baseMock = (impactedFile) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
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
  headName: 'flag1/file.js',
  hashedPath: 'hashedFilePath',
  isRenamedFile: false,
  isDeletedFile: false,
  isCriticalFile: false,
  isNewFile: false,
  baseCoverage: null,
  headCoverage: null,
  patchCoverage: null,
  changeCoverage: null,
  segments: {
    __typename: 'SegmentComparisons',
    results: [
      {
        header: '-0,0 +1,45',
        hasUnintendedChanges: false,
        lines: [
          {
            baseNumber: '1',
            headNumber: '1',
            content: 'const Calculator = ({ value, calcMode }) => {',
            baseCoverage: 'M',
            headCoverage: 'H',
            coverageInfo: {
              hitCount: 18,
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
      isCurrentUserActivated: true,
      repository: {
        __typename: 'Repository',
        private: false,
        defaultBranch: 'main',
        oldestCommitAt: '2022-10-10T11:59:59',
        coverageEnabled: true,
        bundleAnalysisEnabled,
        languages: ['javascript'],
        testAnalyticsEnabled: false,
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
  function setup(
    { impactedFile = mockImpactedFile, bundleAnalysisEnabled = false } = {
      impactedFile: mockImpactedFile,
      bundleAnalysisEnabled: false,
    }
  ) {
    mocks.useScrollToLine.mockImplementation(() => ({
      lineRef: () => {},
      handleClick: vi.fn(),
      targeted: false,
    }))

    server.use(
      graphql.query('ImpactedFileComparison', (info) => {
        return HttpResponse.json({ data: baseMock(impactedFile) })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockOverview(bundleAnalysisEnabled) })
      })
    )
  }

  describe('when rendered', () => {
    it('renders the line changes header', async () => {
      setup()
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const changeHeader = await screen.findByText('-0,0 +1,45')
      expect(changeHeader).toBeInTheDocument()
    })

    it('renders the lines of a segment', async () => {
      setup()
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const calculator = await screen.findByText(/Calculator/)
      expect(calculator).toBeInTheDocument()

      const value = await screen.findByText(/value/)
      expect(value).toBeInTheDocument()

      const calcMode = await screen.findByText(/calcMode/)
      expect(calcMode).toBeInTheDocument()
    })

    describe('when only coverage is enabled', () => {
      it('renders the commit redirect url', async () => {
        setup()
        render(<FileDiff path={'flag1/file.js'} />, { wrapper })

        const viewFullFileText = await screen.findByText(/View full file/)
        expect(viewFullFileText).toBeInTheDocument()
        expect(viewFullFileText).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/pull/1/blob/flag1/file.js'
        )
      })
    })

    describe('when both coverage and bundle products are enabled', () => {
      it('renders the commit redirect url', async () => {
        setup({ bundleAnalysisEnabled: true })
        render(<FileDiff path={'flag1/file.js'} />, { wrapper })

        const viewFullFileText = await screen.findByText(/View full file/)
        expect(viewFullFileText).toBeInTheDocument()
        expect(viewFullFileText).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/pull/1/blob/flag1/file.js?dropdown=coverage'
        )
      })
    })
  })

  describe('a new file', () => {
    beforeEach(() => {
      setup({ impactedFile: { isNewFile: true } })
    })

    it('renders a new file label', async () => {
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const newText = await screen.findByText(/New/i)
      expect(newText).toBeInTheDocument()
    })
  })

  describe('a renamed file', () => {
    beforeEach(() => {
      setup({ impactedFile: { isRenamedFile: true } })
    })
    it('renders a renamed file label', async () => {
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const renamed = await screen.findByText(/Renamed/i)
      expect(renamed).toBeInTheDocument()
    })
  })

  describe('a deleted file', () => {
    beforeEach(() => {
      setup({ impactedFile: { isDeletedFile: true } })
    })
    it('renders a deleted file label', async () => {
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const deleted = await screen.findByText(/Deleted/i)
      expect(deleted).toBeInTheDocument()
    })
  })

  describe('a critical file', () => {
    beforeEach(() => {
      setup({ impactedFile: { isCriticalFile: true } })
    })
    it('renders a critical file label', async () => {
      render(<FileDiff path={'flag1/file.js'} />, { wrapper })

      const criticalFile = await screen.findByText(/Critical File/i)
      expect(criticalFile).toBeInTheDocument()
    })
  })
})
