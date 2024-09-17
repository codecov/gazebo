import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import FileViewer from './FileViewer'

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

vi.mock('../ComponentsSelector', () => ({
  default: () => 'ComponentsSelector',
}))

const mockOwner = {
  username: 'cool-user',
}

const mockCoverage = {
  __typename: 'Repository',
  commit: {
    commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
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
  branch: null,
}

const mockPullData = {
  isCurrentUserPartOfOrg: true,
  repository: {
    __typename: 'Repository',
    private: true,
    pull: {
      pullId: 1,
      head: {
        commitid: '123',
      },
      compareWithBase: {
        __typename: 'Comparison',
        impactedFilesCount: 4,
        indirectChangedFilesCount: 0,
        flagComparisonsCount: 1,
        componentComparisonsCount: 6,
        directChangedFilesCount: 0,
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (
    initialEntries = ['/gh/codecov/cool-repo/pull/123/blob/directory/file.js']
  ) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId/blob/:path+">
          {children}
        </Route>
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

describe('FileViewer', () => {
  function setup() {
    mocks.useScrollToLine.mockImplementation(() => ({
      lineRef: () => {},
      handleClick: vi.fn(),
      targeted: false,
    }))

    server.use(
      graphql.query('DetailOwner', (req, res, ctx) => {
        return HttpResponse.json({ data: { owner: mockOwner } })
      }),
      graphql.query('CoverageForFile', (req, res, ctx) => {
        return HttpResponse.json({
          data: { owner: { repository: mockCoverage } },
        })
      }),
      graphql.query('PullPageData', (req, res, ctx) => {
        return HttpResponse.json({ data: { owner: mockPullData } })
      }),
      graphql.query('BackfillFlagMemberships', (req, res, ctx) => {
        return HttpResponse.json({ data: { owner: null } })
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        return HttpResponse.json({ data: { owner: null } })
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return HttpResponse.json({ data: { owner: null } })
      })
    )
  }

  describe('rendering component', () => {
    beforeEach(() => setup())

    describe('displaying the tree path', () => {
      it('displays repo link', async () => {
        render(<FileViewer />, { wrapper: wrapper() })

        const repoName = await screen.findByRole('link', { name: 'cool-repo' })
        expect(repoName).toBeInTheDocument()
        expect(repoName).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/pull/123/tree'
        )
      })

      it('displays directory link', async () => {
        render(<FileViewer />, { wrapper: wrapper() })

        const repoName = await screen.findByRole('link', { name: 'directory' })
        expect(repoName).toBeInTheDocument()
        expect(repoName).toHaveAttribute(
          'href',
          '/gh/codecov/cool-repo/pull/123/tree/directory'
        )
      })

      it('displays file name', async () => {
        render(<FileViewer />, { wrapper: wrapper() })

        const fileName = await screen.findByText('file.js')
        expect(fileName).toBeInTheDocument()
      })

      it('renders ComponentsSelector', async () => {
        render(<FileViewer />, { wrapper: wrapper() })

        const selector = await screen.findByText('ComponentsSelector')
        expect(selector).toBeInTheDocument()
      })
    })

    describe('displaying the file viewer', () => {
      it('sets the correct url link', async () => {
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
