import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

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
        commitid: null,
        pullId: null,
        branchName: null,
        createdAt: null,
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
                createdAt: '',
                updatedAt: '',
                flags: null,
                jobCode: null,
                downloadUrl: null,
                ciUrl: null,
                uploadType: null,
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
          impactedFiles: [],
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
        commitid: null,
        pullId: null,
        branchName: null,
        createdAt: null,
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
                createdAt: '',
                updatedAt: '',
                flags: null,
                jobCode: null,
                downloadUrl: null,
                ciUrl: null,
                uploadType: null,
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
          impactedFiles: [],
        },
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
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
            {children}
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

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('CommitDetailPageContent', () => {
  function setup(erroredUploads = false) {
    const user = userEvent.setup()

    server.use(
      graphql.query('Commit', (req, res, ctx) => {
        if (erroredUploads) {
          return res(ctx.status(200), ctx.data(mockCommitErroredData))
        }

        return res(ctx.status(200), ctx.data(mockCommitData))
      })
    )

    return { user }
  }

  describe('rendering component', () => {
    beforeEach(() => setup())

    it('renders tabs component', async () => {
      render(<CommitDetailPageContent />, {
        wrapper: wrapper(),
      })

      const fileExplorerTab = await screen.findByText('File explorer')
      expect(fileExplorerTab).toBeInTheDocument()
    })
  })

  describe('there are errored uploads', () => {
    beforeEach(() => setup(true))

    it('displays errored uploads component', async () => {
      render(<CommitDetailPageContent />, {
        wrapper: wrapper(),
      })

      const failedUploads = await screen.findByText(/uploads failed/)
      expect(failedUploads).toBeInTheDocument()
    })
  })

  describe('testing tree route', () => {
    beforeEach(() => setup())

    describe('not path provided', () => {
      it('renders CommitDetailFileExplorer', async () => {
        render(<CommitDetailPageContent />, {
          wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256/tree'),
        })

        const fileExplorer = await screen.findByText('CommitDetailFileExplorer')
        expect(fileExplorer).toBeInTheDocument()
      })
    })

    describe('path provided', () => {
      it('renders CommitDetailFileExplorer', async () => {
        render(<CommitDetailPageContent />, {
          wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256/tree/src/dir'),
        })

        const fileExplorer = await screen.findByText('CommitDetailFileExplorer')
        expect(fileExplorer).toBeInTheDocument()
      })
    })
  })

  describe('testing blob path', () => {
    beforeEach(() => setup())

    it('renders CommitDetailFileViewer', async () => {
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
    beforeEach(() => setup())

    it('renders files changed tab', async () => {
      render(<CommitDetailPageContent />, {
        wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256'),
      })

      const filesChangedTab = await screen.findByText('FilesChangedTab')
      expect(filesChangedTab).toBeInTheDocument()
    })
  })

  describe('testing indirect changes path', () => {
    beforeEach(() => setup())

    it('renders indirect changed files tab', async () => {
      render(<CommitDetailPageContent />, {
        wrapper: wrapper(
          '/gh/codecov/cool-repo/commit/sha256/indirect-changes'
        ),
      })

      const indirectChangesTab = await screen.findByText('IndirectChangesTab')
      expect(indirectChangesTab).toBeInTheDocument()
    })
  })

  describe('testing random paths', () => {
    beforeEach(() => setup())

    it('redirects user to base commit route', async () => {
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
