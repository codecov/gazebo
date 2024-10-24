import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import FileView from './Fileviewer'

window.requestAnimationFrame = (cb) => {
  cb(1)
  return 1
}
window.cancelAnimationFrame = () => {}

const scrollToMock = vi.fn()
window.scrollTo = scrollToMock
window.scrollY = 100

class ResizeObserverMock {
  callback = (x) => null

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

const mockRepoSettings = (isPrivate) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      activated: true,
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

const mockOwner = {
  username: 'cool-user',
}

const mockOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: [],
      testAnalyticsEnabled: false,
    },
  },
}

const mockComponents = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        name: 'branch-1',
        head: {
          commitid: 'commit-123',
          coverageAnalytics: {
            components: [{ name: 'c1', id: 'c1' }],
          },
        },
      },
    },
  },
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

const mockFlagResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      flags: {
        edges: [{ node: { name: 'flag-2' } }],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  },
}

const mockBackfillResponse = {
  config: {
    isTimeScaleEnabled: true,
  },
  owner: {
    repository: {
      coverageAnalytics: {
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: true,
        flagsCount: 1,
      },
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (
    initialEntries = [
      '/gh/criticalrole/mightynein/blob/branchName/folder/file.js',
    ]
  ) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/blob/:ref/:path+">
          {children}
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  vi.resetAllMocks()
  server.close()
})

describe('FileView', () => {
  function setup(
    { tierName = TierNames.PRO, isPrivate = false } = {
      tierName: TierNames.PRO,
      isPrivate: false,
    }
  ) {
    server.use(
      graphql.query('DetailOwner', (info) => {
        return HttpResponse.json({ data: { owner: mockOwner } })
      }),
      graphql.query('CoverageForFile', (info) => {
        return HttpResponse.json({
          data: { owner: { repository: mockCoverage } },
        })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockOverview })
      }),
      graphql.query('BackfillFlagMemberships', (info) => {
        return HttpResponse.json({ data: mockBackfillResponse })
      }),
      graphql.query('FlagsSelect', (info) => {
        return HttpResponse.json({ data: mockFlagResponse })
      }),
      graphql.query('OwnerTier', (info) => {
        return HttpResponse.json({
          data: { owner: { plan: { tierName: tierName } } },
        })
      }),
      graphql.query('GetRepoSettingsTeam', (info) => {
        return HttpResponse.json({ data: mockRepoSettings(isPrivate) })
      }),
      graphql.query('GetBranchComponents', (info) => {
        return HttpResponse.json({ data: mockComponents })
      }),
      graphql.query('GetBranches', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      graphql.query('GetRepoCoverage', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      graphql.query('GetBranch', (info) => {
        return HttpResponse.json({ data: {} })
      })
    )
  }

  describe('rendering component', () => {
    describe('displaying the tree path', () => {
      it('displays repo link', async () => {
        setup()
        render(<FileView />, { wrapper: wrapper() })

        const repoName = await screen.findByRole('link', { name: 'mightynein' })
        expect(repoName).toBeInTheDocument()
        expect(repoName).toHaveAttribute(
          'href',
          '/gh/criticalrole/mightynein/tree/branchName/'
        )
      })

      it('displays directory link', async () => {
        setup()
        render(<FileView />, { wrapper: wrapper() })

        const repoName = await screen.findByRole('link', { name: 'folder' })
        expect(repoName).toBeInTheDocument()
        expect(repoName).toHaveAttribute(
          'href',
          '/gh/criticalrole/mightynein/tree/branchName/folder'
        )
      })

      it('displays file name', async () => {
        setup()
        render(<FileView />, { wrapper: wrapper() })

        const fileName = await screen.findByText('file.js')
        expect(fileName).toBeInTheDocument()
      })
    })

    describe('displaying the file viewer', () => {
      it('sets the correct url link', async () => {
        setup()
        render(<FileView />, { wrapper: wrapper() })

        const copyLink = await screen.findByRole('link', {
          name: 'folder/file.js',
        })
        expect(copyLink).toBeInTheDocument()
        expect(copyLink).toHaveAttribute('href', '#folder/file.js')
      })
    })

    describe('displaying the components selector', () => {
      it('renders the components multi select', async () => {
        setup()
        render(<FileView showComponentsSelect={true} />, { wrapper: wrapper() })

        const select = await screen.findByText('All components')
        expect(select).toBeInTheDocument()
      })
    })

    describe('displaying the flag selector', () => {
      describe('user is not on a team plan', () => {
        it('renders the flag multi select', async () => {
          setup()
          render(<FileView />, { wrapper: wrapper() })

          const select = await screen.findByText('All flags')
          expect(select).toBeInTheDocument()
        })
      })

      describe('on a team plan', () => {
        describe('repo is public', () => {
          it('renders the flag multi select', async () => {
            setup({ tierName: TierNames.TEAM, isPrivate: false })

            render(<FileView />, { wrapper: wrapper() })

            const select = await screen.findByText('All flags')
            expect(select).toBeInTheDocument()
          })
        })

        describe('repo is private', () => {
          it('does not render the flag multi select', async () => {
            setup({ tierName: TierNames.TEAM, isPrivate: true })
            render(<FileView />, { wrapper: wrapper() })

            await waitFor(() => queryClient.isFetching)
            await waitFor(() => !queryClient.isFetching)

            await waitFor(() =>
              expect(screen.queryByText('All flags')).not.toBeInTheDocument()
            )
          })
        })
      })
    })
  })
})
