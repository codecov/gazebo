import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import CommitDetailPageContent from './CommitDetailPageContent'

jest.mock(
  '../subRoute/CommitDetailFileExplorer',
  () => () => 'CommitDetailFileExplorer'
)
jest.mock(
  '../subRoute/CommitDetailFileViewer',
  () => () => 'CommitDetailFileViewer'
)
jest.mock('../subRoute/FilesChangedTab', () => () => 'FilesChangedTab')
jest.mock('../subRoute/IndirectChangesTab', () => () => 'IndirectChangesTab')

const mockCommitData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        totals: null,
        state: null,
        commitid: 'commit-456',
        pullId: 123,
        branchName: null,
        createdAt: '2023-01-01T12:00:00.000000',
        author: null,
        message: null,
        ciPassed: null,
        parent: null,
        uploads: {
          edges: [
            {
              node: {
                state: 'STARTED',
                id: null,
                name: 'upload-1',
                provider: null,
                createdAt: '2023-01-01T12:00:00.000000',
                updatedAt: '',
                flags: null,
                jobCode: null,
                downloadUrl: '/test.txt',
                ciUrl: null,
                uploadType: 'UPLOADED',
                buildCode: null,
                errors: null,
              },
            },
          ],
        },
        compareWithParent: {
          __typename: 'Comparison',
          indirectChangedFilesCount: 99,
          directChangedFilesCount: 19,
          state: 'state',
          patchTotals: null,
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [],
          },
        },
      },
    },
  },
}

const mockCommitErroredData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        totals: null,
        state: null,
        commitid: 'commit-123',
        pullId: 123,
        branchName: null,
        createdAt: '2023-01-01T12:00:00.000000',
        author: null,
        message: null,
        ciPassed: null,
        parent: null,
        uploads: {
          edges: [
            {
              node: {
                state: 'ERROR',
                id: null,
                name: 'upload-1',
                provider: null,
                createdAt: '2023-01-01T12:00:00.000000',
                updatedAt: '',
                flags: null,
                jobCode: null,
                downloadUrl: '/test.txt',
                ciUrl: null,
                uploadType: 'UPLOADED',
                buildCode: null,
                errors: null,
              },
            },
          ],
        },
        compareWithParent: {
          __typename: 'Comparison',
          indirectChangedFilesCount: 99,
          directChangedFilesCount: 19,
          state: 'state',
          patchTotals: null,
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [],
          },
        },
      },
    },
  },
}

const mockRepoSettings = (isPrivate = false) => ({
  owner: {
    repository: {
      defaultBranch: 'master',
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
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const server = setupServer()

let testLocation
const wrapper =
  (initialEntries = '/gh/codecov/cool-repo/commit/sha256') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route
            path={[
              '/:provider/:owner/:repo/commit/:commit/blob/:path+',
              '/:provider/:owner/:repo/commit/:commit/tree/:path+',
              '/:provider/:owner/:repo/commit/:commit/tree/',
              '/:provider/:owner/:repo/commit/:commit',
            ]}
          >
            <Suspense fallback={null}>{children}</Suspense>
          </Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
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

describe('CommitDetailPageContent', () => {
  function setup(
    { erroredUploads = false, tierValue = TierNames.PRO, isPrivate = false } = {
      erroredUploads: false,
      tierValue: TierNames.PRO,
      isPrivate: false,
    }
  ) {
    const user = userEvent.setup()

    server.use(
      graphql.query('Commit', (req, res, ctx) => {
        if (erroredUploads) {
          return res(ctx.status(200), ctx.data(mockCommitErroredData))
        }

        return res(ctx.status(200), ctx.data(mockCommitData))
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({ owner: { plan: { tierName: tierValue } } })
        )
      }),
      graphql.query('GetRepoSettingsTeam', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoSettings(isPrivate)))
      }),
      graphql.query('FlagsSelect', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockFlagsResponse))
      }),
      graphql.query('BackfillFlagMemberships', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockBackfillResponse))
      })
    )

    return { user }
  }

  describe('rendering component', () => {
    it('renders tabs component', async () => {
      setup()
      render(<CommitDetailPageContent />, {
        wrapper: wrapper(),
      })

      const fileExplorerTab = await screen.findByText('File explorer')
      expect(fileExplorerTab).toBeInTheDocument()
    })
  })

  describe('there are errored uploads', () => {
    it('displays errored uploads component', async () => {
      setup({ erroredUploads: true })
      render(<CommitDetailPageContent />, {
        wrapper: wrapper(),
      })

      const failedUploads = await screen.findByText(/uploads failed/)
      expect(failedUploads).toBeInTheDocument()
    })
  })

  describe('testing tree route', () => {
    describe('not path provided', () => {
      it('renders CommitDetailFileExplorer', async () => {
        setup()
        render(<CommitDetailPageContent />, {
          wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256/tree'),
        })

        const fileExplorer = await screen.findByText('CommitDetailFileExplorer')
        expect(fileExplorer).toBeInTheDocument()
      })
    })

    describe('path provided', () => {
      it('renders CommitDetailFileExplorer', async () => {
        setup()
        render(<CommitDetailPageContent />, {
          wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256/tree/src/dir'),
        })

        const fileExplorer = await screen.findByText('CommitDetailFileExplorer')
        expect(fileExplorer).toBeInTheDocument()
      })
    })
  })

  describe('testing blob path', () => {
    it('renders CommitDetailFileViewer', async () => {
      setup()
      render(<CommitDetailPageContent />, {
        wrapper: wrapper(
          '/gh/codecov/cool-repo/commit/sha256/blob/src/file.js'
        ),
      })

      const fileViewer = await screen.findByText('CommitDetailFileViewer')
      expect(fileViewer).toBeInTheDocument()
    })
  })

  describe('testing base commit path', () => {
    it('renders files changed tab', async () => {
      setup()
      render(<CommitDetailPageContent />, {
        wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256'),
      })

      const filesChangedTab = await screen.findByText('FilesChangedTab')
      expect(filesChangedTab).toBeInTheDocument()
    })
  })

  describe('testing indirect changes path', () => {
    it('renders indirect changed files tab', async () => {
      setup()
      render(<CommitDetailPageContent />, {
        wrapper: wrapper(
          '/gh/codecov/cool-repo/commit/sha256/indirect-changes'
        ),
      })

      const indirectChangesTab = await screen.findByText('IndirectChangesTab')
      expect(indirectChangesTab).toBeInTheDocument()
    })

    describe('user is on a team plan', () => {
      describe('user has a public repo', () => {
        it('renders the indirect changes tab', async () => {
          setup({ tierValue: TierNames.TEAM, isPrivate: false })
          render(<CommitDetailPageContent />, {
            wrapper: wrapper(
              '/gh/codecov/cool-repo/commit/sha256/indirect-changes'
            ),
          })

          const indirectChangesTab = await screen.findByText(
            'IndirectChangesTab'
          )
          expect(indirectChangesTab).toBeInTheDocument()
        })
      })

      describe('user has a private repo', () => {
        it('redirects user to files changed tab', async () => {
          setup({ tierValue: TierNames.TEAM, isPrivate: true })
          render(<CommitDetailPageContent />, {
            wrapper: wrapper(
              '/gh/codecov/cool-repo/commit/sha256/indirect-changes'
            ),
          })

          const filesChangedTab = await screen.findByText('FilesChangedTab')
          expect(filesChangedTab).toBeInTheDocument()
        })
      })
    })
  })

  describe('testing random paths', () => {
    it('redirects user to base commit route', async () => {
      setup()
      render(<CommitDetailPageContent />, {
        wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256/blah'),
      })

      await waitFor(() =>
        expect(testLocation.pathname).toBe(
          '/gh/codecov/cool-repo/commit/sha256'
        )
      )

      const filesChangedTab = await screen.findByText('FilesChangedTab')
      expect(filesChangedTab).toBeInTheDocument()
    })
  })

  describe('test tab navigation', () => {
    describe('user clicks files tab', () => {
      it('navigates to files url', async () => {
        const { user } = setup()
        render(<CommitDetailPageContent />, {
          wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256'),
        })

        const link = await screen.findByRole('link', { name: 'File explorer' })
        await user.click(link)

        await waitFor(() =>
          expect(testLocation.pathname).toBe(
            '/gh/codecov/cool-repo/commit/sha256/tree'
          )
        )
      })
    })

    describe('user clicks files changed tab', () => {
      it('navigates to base url', async () => {
        const { user } = setup()
        render(<CommitDetailPageContent />, {
          wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256/tree'),
        })

        const link = await screen.findByRole('link', { name: /Files changed/ })
        await user.click(link)

        await waitFor(() =>
          expect(testLocation.pathname).toBe(
            '/gh/codecov/cool-repo/commit/sha256'
          )
        )
      })
    })

    describe('user clicks indirect changes tab', () => {
      it('navigates to base url', async () => {
        const { user } = setup()
        render(<CommitDetailPageContent />, {
          wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256/tree'),
        })

        const link = await screen.findByRole('link', {
          name: /Indirect changes/,
        })
        await user.click(link)

        await waitFor(() =>
          expect(testLocation.pathname).toBe(
            '/gh/codecov/cool-repo/commit/sha256/indirect-changes'
          )
        )
      })
    })

    describe('rendering tabs count', () => {
      beforeEach(() => setup())

      it('renders files changed tab count', async () => {
        render(<CommitDetailPageContent />, {
          wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256'),
        })

        const tabCount = await screen.findByText('19')
        expect(tabCount).toBeInTheDocument()
      })

      it('renders indirect changes tab count', async () => {
        render(<CommitDetailPageContent />, {
          wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256'),
        })

        const tabCount = await screen.findByText('99')
        expect(tabCount).toBeInTheDocument()
      })
    })
  })
})
