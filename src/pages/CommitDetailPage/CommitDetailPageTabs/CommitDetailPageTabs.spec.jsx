import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import CommitDetailPageTabs from './CommitDetailPageTabs'

jest.mock('shared/featureFlags')

const mockRepoSettings = (isPrivate) => ({
  owner: {
    repository: {
      defaultBranch: 'main',
      private: isPrivate,
      uploadToken: 'token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
    },
  },
})

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

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
            <Suspense fallback={null}>{children}</Suspense>
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
  function setup(
    { flagValue = false, tierValue = TierNames.PRO, isPrivate = false } = {
      flagValue: false,
      tierValue: TierNames.PRO,
      isPrivate: false,
    }
  ) {
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
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({ owner: { plan: { tierName: tierValue } } })
        )
      }),
      graphql.query('GetRepoSettingsTeam', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoSettings(isPrivate)))
      })
    )
  }

  describe('user is on a team plan', () => {
    describe('repo is public', () => {
      it('does not render the indirect changes tab', async () => {
        setup({ tierValue: TierNames.TEAM, isPrivate: false })
        render(<CommitDetailPageTabs commitSha="sha256" />, {
          wrapper: wrapper(),
        })

        const filesChanged = await screen.findByText('Files changed')
        expect(filesChanged).toBeInTheDocument()

        const indirectChanges = await screen.findByText('Indirect changes')
        expect(indirectChanges).toBeInTheDocument()

        const filesExplorerTab = await screen.findByText('File explorer')
        expect(filesExplorerTab).toBeInTheDocument()
      })
    })
    describe('repo is private', () => {
      it('does not render the indirect changes tab', async () => {
        setup({ tierValue: TierNames.TEAM, isPrivate: true })
        render(<CommitDetailPageTabs commitSha="sha256" />, {
          wrapper: wrapper(),
        })

        const filesChanged = await screen.findByText('Files changed')
        expect(filesChanged).toBeInTheDocument()

        const indirectChanges = screen.queryByText('Indirect changes')
        expect(indirectChanges).not.toBeInTheDocument()

        const filesExplorerTab = await screen.findByText('File explorer')
        expect(filesExplorerTab).toBeInTheDocument()
      })
    })
  })

  describe('on base route', () => {
    it('highlights files changed tab', async () => {
      setup()
      render(<CommitDetailPageTabs commitSha="sha256" />, {
        wrapper: wrapper(),
      })

      const filesChanged = await screen.findByText('Files changed')
      expect(filesChanged).toBeInTheDocument()
      expect(filesChanged).toHaveAttribute('aria-current', 'page')
    })

    it('does not highlight files tab', async () => {
      setup()
      render(<CommitDetailPageTabs commitSha="sha256" />, {
        wrapper: wrapper(),
      })

      const filesExplorerTab = await screen.findByText('File explorer')
      expect(filesExplorerTab).toBeInTheDocument()
      expect(filesExplorerTab).not.toHaveAttribute('aria-current', 'page')
    })
  })

  describe('on indirect changes route', () => {
    it('highlights indirect changes tab', async () => {
      setup()
      render(<CommitDetailPageTabs commitSha="sha256" />, {
        wrapper: wrapper([
          '/gh/codecov/cool-repo/commit/sha256/indirect-changes',
        ]),
      })

      const filesChanged = await screen.findByText('Indirect changes')
      expect(filesChanged).toBeInTheDocument()
      expect(filesChanged).toHaveAttribute('aria-current', 'page')
    })

    it('does not highlight files changed tab', async () => {
      setup()
      render(<CommitDetailPageTabs commitSha="sha256" />, {
        wrapper: wrapper([
          '/gh/codecov/cool-repo/commit/sha256/indirect-changes',
        ]),
      })

      const filesChanged = await screen.findByText('Files changed')
      expect(filesChanged).toBeInTheDocument()
      expect(filesChanged).not.toHaveAttribute('aria-current', 'page')
    })
  })

  describe('on files route', () => {
    describe('on tree route', () => {
      it('highlights files tab', async () => {
        setup()
        render(<CommitDetailPageTabs commitSha="sha256" />, {
          wrapper: wrapper(['/gh/codecov/cool-repo/commit/sha256/tree']),
        })

        const filesExplorerTab = await screen.findByText('File explorer')
        expect(filesExplorerTab).toBeInTheDocument()
        expect(filesExplorerTab).toHaveAttribute('aria-current', 'page')
      })

      it('does not highlight files changed tab', async () => {
        setup()
        render(<CommitDetailPageTabs commitSha="sha256" />, {
          wrapper: wrapper(['/gh/codecov/cool-repo/commit/sha256/tree']),
        })

        const filesChanged = await screen.findByText('Files changed')
        expect(filesChanged).toBeInTheDocument()
        expect(filesChanged).not.toHaveAttribute('aria-current', 'page')
      })
    })

    describe('on a blob route', () => {
      it('highlights files tab', async () => {
        setup()
        render(<CommitDetailPageTabs commitSha="sha256" />, {
          wrapper: wrapper([
            '/gh/codecov/cool-repo/commit/sha256/blob/index.js',
          ]),
        })

        const filesExplorerTab = await screen.findByText('File explorer')
        expect(filesExplorerTab).toBeInTheDocument()
        expect(filesExplorerTab).toHaveAttribute('aria-current', 'page')
      })

      it('does not highlight files changed tab', async () => {
        setup()
        render(<CommitDetailPageTabs commitSha="sha256" />, {
          wrapper: wrapper(['/gh/codecov/cool-repo/commit/sha256/tree']),
        })

        const filesChanged = await screen.findByText('Files changed')
        expect(filesChanged).toBeInTheDocument()
        expect(filesChanged).not.toHaveAttribute('aria-current', 'page')
      })
    })
  })

  describe('rendering toggle header', () => {
    it('renders uncovered legend', async () => {
      setup()
      render(<CommitDetailPageTabs commitSha="sha256" />, {
        wrapper: wrapper(),
      })

      const legend = await screen.findByText('uncovered')
      expect(legend).toBeInTheDocument()
    })

    it('renders partial legend', async () => {
      setup()
      render(<CommitDetailPageTabs commitSha="sha256" />, {
        wrapper: wrapper(),
      })

      const legend = await screen.findByText('partial')
      expect(legend).toBeInTheDocument()
    })

    it('renders covered legend', async () => {
      setup()
      render(<CommitDetailPageTabs commitSha="sha256" />, {
        wrapper: wrapper(),
      })

      const legend = await screen.findByText('covered')
      expect(legend).toBeInTheDocument()
    })

    it('renders hit count legend', async () => {
      setup()
      render(<CommitDetailPageTabs commitSha="sha256" />, {
        wrapper: wrapper(),
      })

      const hitIcon = await screen.findByText('n')
      expect(hitIcon).toBeInTheDocument()

      const legendText = await screen.findByText('upload #')
      expect(legendText).toBeInTheDocument()
    })
  })

  describe('there are query params in the url', () => {
    it('appends them to the files changed tab link', async () => {
      const queryString = qs.stringify(
        { flags: ['flag-1'] },
        { addQueryPrefix: true }
      )
      setup()
      render(<CommitDetailPageTabs commitSha="sha256" />, {
        wrapper: wrapper([`/gh/codecov/cool-repo/commit/sha256${queryString}`]),
      })

      const filesChanged = await screen.findByRole('link', {
        name: /Files changed/,
      })
      expect(filesChanged).toBeInTheDocument()
      expect(filesChanged).toHaveAttribute(
        'href',
        '/gh/codecov/cool-repo/commit/sha256?flags%5B0%5D=flag-1'
      )
    })

    it('appends them to the indirect changes tab link', async () => {
      const queryString = qs.stringify(
        { flags: ['flag-1'] },
        { addQueryPrefix: true }
      )
      setup()
      render(<CommitDetailPageTabs commitSha="sha256" />, {
        wrapper: wrapper([`/gh/codecov/cool-repo/commit/sha256${queryString}`]),
      })

      const indirectChanges = await screen.findByRole('link', {
        name: /Indirect changes/,
      })
      expect(indirectChanges).toBeInTheDocument()
      expect(indirectChanges).toHaveAttribute(
        'href',
        '/gh/codecov/cool-repo/commit/sha256/indirect-changes?flags%5B0%5D=flag-1'
      )
    })

    it('appends them to the file explorer tab link', async () => {
      const queryString = qs.stringify(
        { flags: ['flag-1'] },
        { addQueryPrefix: true }
      )
      setup()
      render(<CommitDetailPageTabs commitSha="sha256" />, {
        wrapper: wrapper([`/gh/codecov/cool-repo/commit/sha256${queryString}`]),
      })

      const fileExplorer = await screen.findByRole('link', {
        name: /File explorer/,
      })
      expect(fileExplorer).toBeInTheDocument()
      expect(fileExplorer).toHaveAttribute(
        'href',
        '/gh/codecov/cool-repo/commit/sha256/tree?flags%5B0%5D=flag-1'
      )
    })
  })

  describe('flags multi-select', () => {
    describe('user is not on a team plan', () => {
      it('renders flag multi-select', async () => {
        setup({ flagValue: true })
        render(<CommitDetailPageTabs commitSha="sha256" />, {
          wrapper: wrapper(),
        })

        const flagSelect = await screen.findByText('All flags')
        expect(flagSelect).toBeInTheDocument()
      })
    })

    describe('user is on a team plan', () => {
      describe('repo is public', () => {
        it('renders flag multi-select', async () => {
          setup({
            flagValue: true,
            tierValue: TierNames.TEAM,
            isPrivate: false,
          })
          render(<CommitDetailPageTabs commitSha="sha256" />, {
            wrapper: wrapper(),
          })

          const flagSelect = await screen.findByText('All flags')
          expect(flagSelect).toBeInTheDocument()
        })
      })

      describe('repo is private', () => {
        it('does not render the multi select', async () => {
          setup({ flagValue: true, tierValue: TierNames.TEAM, isPrivate: true })
          render(<CommitDetailPageTabs commitSha="sha256" />, {
            wrapper: wrapper(),
          })

          const filesChanged = await screen.findByText('Files changed')
          expect(filesChanged).toBeInTheDocument()

          const flagSelect = screen.queryByText('All flags')
          expect(flagSelect).not.toBeInTheDocument()
        })
      })
    })
  })
})
