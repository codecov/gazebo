import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import FileViewer from './FileViewer'

vi.mock('../ComponentsSelector', () => ({
  default: () => 'ComponentsSelector',
}))

window.requestAnimationFrame = (cb) => {
  cb(1)
  return 1
}
window.cancelAnimationFrame = () => {}

const scrollToMock = vi.fn()
window.scrollTo = scrollToMock
window.scrollY = 100

class ResizeObserverMock {
  callback = (_x) => null

  constructor(callback) {
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

const mockOwner = {
  username: 'cool-user',
}

const mockCoverage = {
  __typename: 'Repository',
  commit: {
    commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
    coverageAnalytics: {
      flagNames: ['a', 'b'],
      components: [],
      coverageFile: {
        hashedPath: 'hashed-path',
        isCriticalFile: false,
        content:
          'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n\n\n\n',
        coverage: [
          { line: 1, coverage: 'H' },
          { line: 2, coverage: 'H' },
          { line: 4, coverage: 'H' },
          { line: 5, coverage: 'H' },
          { line: 7, coverage: 'H' },
          { line: 8, coverage: 'H' },
        ],
        totals: {
          percentCovered: 100,
        },
      },
    },
  },
  branch: null,
}

const mockPullData = {
  isCurrentUserPartOfOrg: true,
  repository: {
    __typename: 'Repository',
    private: true,
    coverageEnabled: true,
    bundleAnalysisEnabled: true,
    pull: {
      pullId: 1,
      commits: {
        totalCount: 11,
      },
      head: {
        commitid: '123',
        bundleAnalysis: {
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            isCached: false,
          },
        },
      },
      compareWithBase: {
        __typename: 'Comparison',
        impactedFilesCount: 4,
        indirectChangedFilesCount: 0,
        flagComparisonsCount: 1,
        componentComparisonsCount: 6,
        directChangedFilesCount: 0,
      },
      bundleAnalysisCompareWithBase: {
        __typename: 'BundleAnalysisComparison',
      },
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (
    initialEntries = ['/gh/codecov/cool-repo/pull/123/blob/directory/file.js']
  ) =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/pull/:pullId/blob/:path+">
            <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    </QueryClientProviderV5>
  )

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('FileViewer', () => {
  function setup() {
    server.use(
      graphql.query('DetailOwner', () => {
        return HttpResponse.json({ data: { owner: mockOwner } })
      }),
      graphql.query('CoverageForFile', () => {
        return HttpResponse.json({
          data: { owner: { repository: mockCoverage } },
        })
      }),
      graphql.query('PullPageData', () => {
        return HttpResponse.json({ data: { owner: mockPullData } })
      }),
      graphql.query('BackfillFlagMemberships', () => {
        return HttpResponse.json({ data: { owner: null } })
      }),
      graphql.query('OwnerPlan', () => {
        return HttpResponse.json({ data: { owner: null } })
      }),
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: { owner: null } })
      })
    )
  }

  describe('rendering component', () => {
    describe('displaying the tree path', () => {
      it('displays repo link', async () => {
        setup()
        render(<FileViewer />, { wrapper: wrapper() })

        const repoName = await screen.findByRole('link', { name: 'cool-repo' })
        expect(repoName).toBeInTheDocument()
        expect(repoName).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/pull/123/tree'
        )
      })

      it('displays directory link', async () => {
        setup()
        render(<FileViewer />, { wrapper: wrapper() })

        const repoName = await screen.findByRole('link', { name: 'directory' })
        expect(repoName).toBeInTheDocument()
        expect(repoName).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/pull/123/tree/directory'
        )
      })

      it('displays file name', async () => {
        setup()
        render(<FileViewer />, { wrapper: wrapper() })

        const fileName = await screen.findByText('file.js')
        expect(fileName).toBeInTheDocument()
      })

      it('renders ComponentsSelector', async () => {
        setup()
        render(<FileViewer />, { wrapper: wrapper() })

        const selector = await screen.findByText('ComponentsSelector')
        expect(selector).toBeInTheDocument()
      })
    })

    describe('displaying the file viewer', () => {
      it('sets the correct url link', async () => {
        setup()
        render(<FileViewer />, { wrapper: wrapper() })

        const copyLink = await screen.findByRole('link', {
          name: 'directory/file.js',
        })
        expect(copyLink).toBeInTheDocument()
        expect(copyLink).toHaveAttribute('href', '#directory/file.js')
      })
    })
  })
})
