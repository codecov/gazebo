import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import CommitDetailPageTabs from './CommitDetailPageTabs'

jest.mock('shared/featureFlags')

const mockFlagsResponse = {
  owner: {
    repository: {
      flags: {
        edges: [
          {
            node: {
              name: 'flag-1',
            },
          },
        ],
        pageInfo: {
          hasNextPage: true,
          endCursor: '1-flag-1',
        },
      },
    },
  },
}

const mockBackfillResponse = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      flagsMeasurementsActive: true,
      flagsMeasurementsBackfilled: true,
      flagsCount: 4,
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient()
const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/commit/sha256']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route
            path={[
              '/:provider/:owner/:repo/commit/:commit',
              '/:provider/:owner/:repo/commit/:commit/indirect-changes',
              '/:provider/:owner/:repo/commit/:commit/tree',
              '/:provider/:owner/:repo/commit/:commit/tree/:path+',
              '/:provider/:owner/:repo/commit/:commit/blob/:path+',
            ]}
          >
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

describe('CommitDetailPageTabs', () => {
  function setup({ flagValue = false } = { flagValue: false }) {
    useFlags.mockReturnValue({
      commitTabFlagMultiSelect: flagValue,
      coverageTabFlagMutliSelect: flagValue,
    })

    server.use(
      graphql.query('FlagsSelect', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockFlagsResponse))
      }),
      graphql.query('BackfillFlagMemberships', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockBackfillResponse))
      })
    )
  }

  describe('on base route', () => {
    it('highlights files changed tab', () => {
      setup()
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper(),
      })

      const filesChanged = screen.getByText('Files changed')
      expect(filesChanged).toBeInTheDocument()
      expect(filesChanged).toHaveAttribute('aria-current', 'page')
    })

    it('does not highlight files tab', () => {
      setup()
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper(),
      })

      const filesExplorerTab = screen.getByText('File explorer')
      expect(filesExplorerTab).toBeInTheDocument()
      expect(filesExplorerTab).not.toHaveAttribute('aria-current', 'page')
    })
  })

  describe('on indirect changes route', () => {
    it('highlights indirect changes tab', () => {
      setup()
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper([
          '/gh/codecov/cool-repo/commit/sha256/indirect-changes',
        ]),
      })

      const filesChanged = screen.getByText('Indirect changes')
      expect(filesChanged).toBeInTheDocument()
      expect(filesChanged).toHaveAttribute('aria-current', 'page')
    })

    it('does not highlight files changed tab', () => {
      setup()
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper([
          '/gh/codecov/cool-repo/commit/sha256/indirect-changes',
        ]),
      })

      const filesChanged = screen.getByText('Files changed')
      expect(filesChanged).toBeInTheDocument()
      expect(filesChanged).not.toHaveAttribute('aria-current', 'page')
    })
  })

  describe('on files route', () => {
    describe('on tree route', () => {
      it('highlights files tab', () => {
        setup()
        render(<CommitDetailPageTabs commitSHA="sha256" />, {
          wrapper: wrapper(['/gh/codecov/cool-repo/commit/sha256/tree']),
        })

        const filesExplorerTab = screen.getByText('File explorer')
        expect(filesExplorerTab).toBeInTheDocument()
        expect(filesExplorerTab).toHaveAttribute('aria-current', 'page')
      })

      it('does not highlight files changed tab', () => {
        setup()
        render(<CommitDetailPageTabs commitSHA="sha256" />, {
          wrapper: wrapper(['/gh/codecov/cool-repo/commit/sha256/tree']),
        })

        const filesChanged = screen.getByText('Files changed')
        expect(filesChanged).toBeInTheDocument()
        expect(filesChanged).not.toHaveAttribute('aria-current', 'page')
      })
    })

    describe('on a blob route', () => {
      it('highlights files tab', () => {
        setup()
        render(<CommitDetailPageTabs commitSHA="sha256" />, {
          wrapper: wrapper([
            '/gh/codecov/cool-repo/commit/sha256/blob/index.js',
          ]),
        })

        const filesExplorerTab = screen.getByText('File explorer')
        expect(filesExplorerTab).toBeInTheDocument()
        expect(filesExplorerTab).toHaveAttribute('aria-current', 'page')
      })

      it('does not highlight files changed tab', () => {
        setup()
        render(<CommitDetailPageTabs commitSHA="sha256" />, {
          wrapper: wrapper(['/gh/codecov/cool-repo/commit/sha256/tree']),
        })

        const filesChanged = screen.getByText('Files changed')
        expect(filesChanged).toBeInTheDocument()
        expect(filesChanged).not.toHaveAttribute('aria-current', 'page')
      })
    })
  })

  describe('rendering toggle header', () => {
    it('renders uncovered legend', () => {
      setup()
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper(),
      })

      const legend = screen.getByText('uncovered')
      expect(legend).toBeInTheDocument()
    })

    it('renders partial legend', () => {
      setup()
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper(),
      })

      const legend = screen.getByText('partial')
      expect(legend).toBeInTheDocument()
    })

    it('renders covered legend', () => {
      setup()
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper(),
      })

      const legend = screen.getByText('covered')
      expect(legend).toBeInTheDocument()
    })

    it('renders hit count legend', () => {
      setup()
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper(),
      })

      const hitIcon = screen.getByText('n')
      expect(hitIcon).toBeInTheDocument()

      const legendText = screen.getByText('upload #')
      expect(legendText).toBeInTheDocument()
    })
  })

  describe('there are query params in the url', () => {
    it('appends them to the files changed tab link', () => {
      const queryString = qs.stringify(
        { flags: ['flag-1'] },
        { addQueryPrefix: true }
      )
      setup()
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper([`/gh/codecov/cool-repo/commit/sha256${queryString}`]),
      })

      const filesChanged = screen.getByRole('link', { name: /Files changed/ })
      expect(filesChanged).toBeInTheDocument()
      expect(filesChanged).toHaveAttribute(
        'href',
        '/gh/codecov/cool-repo/commit/sha256?flags%5B0%5D=flag-1'
      )
    })

    it('appends them to the indirect changes tab link', () => {
      const queryString = qs.stringify(
        { flags: ['flag-1'] },
        { addQueryPrefix: true }
      )
      setup()
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper([`/gh/codecov/cool-repo/commit/sha256${queryString}`]),
      })

      const indirectChanges = screen.getByRole('link', {
        name: /Indirect changes/,
      })
      expect(indirectChanges).toBeInTheDocument()
      expect(indirectChanges).toHaveAttribute(
        'href',
        '/gh/codecov/cool-repo/commit/sha256/indirect-changes?flags%5B0%5D=flag-1'
      )
    })

    it('appends them to the file explorer tab link', () => {
      const queryString = qs.stringify(
        { flags: ['flag-1'] },
        { addQueryPrefix: true }
      )
      setup()
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper([`/gh/codecov/cool-repo/commit/sha256${queryString}`]),
      })

      const fileExplorer = screen.getByRole('link', { name: /File explorer/ })
      expect(fileExplorer).toBeInTheDocument()
      expect(fileExplorer).toHaveAttribute(
        'href',
        '/gh/codecov/cool-repo/commit/sha256/tree?flags%5B0%5D=flag-1'
      )
    })
  })

  describe('flags multi-select', () => {
    it('renders flag multi-select', async () => {
      setup({ flagValue: true })
      render(<CommitDetailPageTabs commitSHA="sha256" />, {
        wrapper: wrapper(),
      })

      const flagSelect = await screen.findByText('All flags')
      expect(flagSelect).toBeInTheDocument()
    })
  })
})
