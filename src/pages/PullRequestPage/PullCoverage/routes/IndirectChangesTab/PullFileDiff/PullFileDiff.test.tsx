import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import PullFileDiff from './PullFileDiff'

const mocks = vi.hoisted(() => ({
  useScrollToLine: vi.fn(),
  withProfiler: (component: any) => component,
  captureMessage: vi.fn(),
}))

vi.mock('ui/CodeRenderer/hooks/useScrollToLine', async () => {
  const actual = await vi.importActual('ui/CodeRenderer/hooks/useScrollToLine')
  return {
    ...actual,
    useScrollToLine: mocks.useScrollToLine,
  }
})

vi.mock('@sentry/react', () => {
  const originalModule = vi.importActual('@sentry/react')
  return {
    ...originalModule,
    withProfiler: mocks.withProfiler,
    captureMessage: mocks.captureMessage,
  }
})

window.requestAnimationFrame = (cb) => {
  cb(1)
  return 1
}
window.cancelAnimationFrame = () => {}

const scrollToMock = vi.fn()
window.scrollTo = scrollToMock
window.scrollY = 100

class ResizeObserverMock {
  callback = (x: any) => null

  constructor(callback: any) {
    this.callback = callback
  }

  observe() {
    this.callback([
      {
        contentRect: { width: 100 },
        target: {
          getAttribute: () => ({ scrollWidth: 100 }),
          getBoundingClientRect: () => ({ top: 100 }),
        },
      },
    ])
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}
global.window.ResizeObserver = ResizeObserverMock

const baseMock = ({
  isNewFile,
  isRenamedFile,
  isDeletedFile,
  isCriticalFile,
}: {
  isNewFile?: boolean
  isRenamedFile?: boolean
  isDeletedFile?: boolean
  isCriticalFile?: boolean
}) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          impactedFile: {
            headName: 'flag1/file.js',
            hashedPath: 'hashedFilePath',
            isRenamedFile,
            isDeletedFile,
            isCriticalFile,
            isNewFile,
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
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
  },
})

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
  defaultOptions: { queries: { retry: false, suspense: true } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo/pull/1']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  bundleAnalysisEnabled?: boolean
  isNewFile?: boolean
  isRenamedFile?: boolean
  isDeletedFile?: boolean
  isCriticalFile?: boolean
}

describe('FileDiff', () => {
  function setup({
    bundleAnalysisEnabled = false,
    isNewFile = false,
    isRenamedFile = false,
    isDeletedFile = false,
    isCriticalFile = false,
  }: SetupArgs) {
    mocks.useScrollToLine.mockImplementation(() => ({
      lineRef: () => {},
      handleClick: vi.fn(),
      targeted: false,
    }))

    server.use(
      graphql.query('ImpactedFileComparison', (info) => {
        return HttpResponse.json({
          data: baseMock({
            isNewFile,
            isRenamedFile,
            isDeletedFile,
            isCriticalFile,
          }),
        })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockOverview(bundleAnalysisEnabled) })
      })
    )
  }

  describe('when rendered', () => {
    it('renders the line changes header', async () => {
      setup({})
      render(<PullFileDiff path={'flag1/file.js'} />, { wrapper })

      const changeHeader = await screen.findByText('-0,0 +1,45')
      expect(changeHeader).toBeInTheDocument()
    })

    describe('when only coverage is enabled', () => {
      it('renders the commit redirect url', async () => {
        setup({})
        render(<PullFileDiff path={'flag1/file.js'} />, { wrapper })

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
        render(<PullFileDiff path={'flag1/file.js'} />, { wrapper })

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
      setup({ isNewFile: true })
    })

    it('renders a new file label', async () => {
      render(<PullFileDiff path={'flag1/file.js'} />, { wrapper })

      const newText = await screen.findByText(/New/i)
      expect(newText).toBeInTheDocument()
    })
  })

  describe('a renamed file', () => {
    beforeEach(() => {
      setup({ isRenamedFile: true })
    })
    it('renders a renamed file label', async () => {
      render(<PullFileDiff path={'flag1/file.js'} />, { wrapper })

      const renamed = await screen.findByText(/Renamed/i)
      expect(renamed).toBeInTheDocument()
    })
  })

  describe('a deleted file', () => {
    beforeEach(() => {
      setup({ isDeletedFile: true })
    })
    it('renders a deleted file label', async () => {
      render(<PullFileDiff path={'flag1/file.js'} />, { wrapper })

      const deleted = await screen.findByText(/Deleted/i)
      expect(deleted).toBeInTheDocument()
    })
  })

  describe('a critical file', () => {
    beforeEach(() => {
      setup({ isCriticalFile: true })
    })
    it('renders a critical file label', async () => {
      render(<PullFileDiff path={'flag1/file.js'} />, { wrapper })

      const criticalFile = await screen.findByText(/Critical File/i)
      expect(criticalFile).toBeInTheDocument()
    })
  })

  describe('code renderer', () => {
    it('renders the textarea', async () => {
      setup({})
      render(<PullFileDiff path={'flag1/file.js'} />, { wrapper })

      const textArea = await screen.findByTestId(
        'virtual-file-renderer-text-area'
      )
      expect(textArea).toBeInTheDocument()

      const calculator = await within(textArea).findByText(/Calculator/)
      expect(calculator).toBeInTheDocument()

      const value = await within(textArea).findByText(/value/)
      expect(value).toBeInTheDocument()

      const calcMode = await within(textArea).findByText(/calcMode/)
      expect(calcMode).toBeInTheDocument()
    })

    it('renders the lines of a segment', async () => {
      setup({})
      render(<PullFileDiff path={'flag1/file.js'} />, { wrapper })

      const codeDisplayOverlay = await screen.findByTestId(
        'virtual-file-renderer-overlay'
      )

      const calculator =
        await within(codeDisplayOverlay).findByText(/Calculator/)
      expect(calculator).toBeInTheDocument()

      const value = await within(codeDisplayOverlay).findByText(/value/)
      expect(value).toBeInTheDocument()

      const calcMode = await within(codeDisplayOverlay).findByText(/calcMode/)
      expect(calcMode).toBeInTheDocument()
    })
  })

  describe('when path is undefined', () => {
    it('renders an error message', async () => {
      setup({})
      render(<PullFileDiff path={undefined} />, { wrapper })

      const errorMessage = await screen.findByText(
        /There was a problem getting the source code from your provider./
      )
      expect(errorMessage).toBeInTheDocument()
    })

    it('renders a login link', async () => {
      setup({})
      render(<PullFileDiff path={undefined} />, { wrapper })

      const loginLink = await screen.findByRole('link', { name: /logging in/ })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })
  })
})
