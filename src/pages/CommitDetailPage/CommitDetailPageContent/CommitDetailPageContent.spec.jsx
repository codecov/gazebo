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
jest.mock('../subRoute/ImpactedFiles', () => () => 'ImpactedFiles')

const mockCommitData = {
  owner: {
    repository: {
      commit: {
        uploads: {
          edges: [
            {
              node: {
                name: 'upload-1',
              },
            },
          ],
        },
      },
    },
  },
}

const mockCommitErroredData = {
  owner: {
    repository: {
      commit: {
        uploads: {
          edges: [
            {
              node: {
                name: 'upload-1',
                state: 'ERROR',
              },
            },
          ],
        },
      },
    },
  },
}

const queryClient = new QueryClient()
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
    server.use(
      graphql.query('Commit', (req, res, ctx) => {
        if (erroredUploads) {
          return res(ctx.status(200), ctx.data(mockCommitErroredData))
        }

        return res(ctx.status(200), ctx.data(mockCommitData))
      })
    )
  }

  describe('rendering component', () => {
    beforeEach(() => setup())

    it('renders tabs component', async () => {
      render(<CommitDetailPageContent />, {
        wrapper: wrapper(),
      })

      const filesTab = await screen.findByText('Files')
      expect(filesTab).toBeInTheDocument()
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

    it('renders ImpactedFiles', async () => {
      render(<CommitDetailPageContent />, {
        wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256'),
      })

      const impactedFiles = await screen.findByText('ImpactedFiles')
      expect(impactedFiles).toBeInTheDocument()
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

      const impactedFiles = await screen.findByText('ImpactedFiles')
      expect(impactedFiles).toBeInTheDocument()
    })
  })

  describe('test tab navigation', () => {
    beforeEach(() => setup())

    describe('user clicks files tab', () => {
      it('navigates to files url', async () => {
        render(<CommitDetailPageContent />, {
          wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256'),
        })

        const link = await screen.findByRole('link', { name: 'Files' })
        userEvent.click(link)

        await waitFor(() =>
          expect(testLocation.pathname).toBe(
            '/gh/codecov/cool-repo/commit/sha256/tree'
          )
        )
      })
    })

    describe('user clicks impacted files tab', () => {
      it('navigates to base url', async () => {
        render(<CommitDetailPageContent />, {
          wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256/tree'),
        })

        const link = await screen.findByRole('link', { name: 'Impacted Files' })
        userEvent.click(link)

        await waitFor(() =>
          expect(testLocation.pathname).toBe(
            '/gh/codecov/cool-repo/commit/sha256'
          )
        )
      })
    })
  })
})
