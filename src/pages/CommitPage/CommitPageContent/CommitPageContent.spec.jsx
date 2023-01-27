import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitPageContent from './CommitPageContent'

jest.mock('../subRoute/CommitFileExplorer', () => () => 'CommitFileExplorer')
jest.mock('../subRoute/CommitFileViewer', () => () => 'CommitFileViewer')
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

describe('CommitPageContent', () => {
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
      render(<CommitPageContent />, {
        wrapper: wrapper(),
      })

      const filesTab = await screen.findByText('Files')
      expect(filesTab).toBeInTheDocument()
    })
  })

  describe('there are errored uploads', () => {
    beforeEach(() => setup(true))

    it('displays errored uploads component', async () => {
      render(<CommitPageContent />, {
        wrapper: wrapper(),
      })

      const failedUploads = await screen.findByText(/uploads failed/)
      expect(failedUploads).toBeInTheDocument()
    })
  })

  describe('testing tree route', () => {
    beforeEach(() => {
      setup()
    })

    describe('not path provided', () => {
      it('renders CommitFileExplorer', async () => {
        render(<CommitPageContent />, {
          wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256/tree'),
        })

        const fileExplorer = await screen.findByText('CommitFileExplorer')
        expect(fileExplorer).toBeInTheDocument()
      })
    })

    describe('path provided', () => {
      it('renders CommitFileExplorer', async () => {
        render(<CommitPageContent />, {
          wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256/tree/src/dir'),
        })

        const fileExplorer = await screen.findByText('CommitFileExplorer')
        expect(fileExplorer).toBeInTheDocument()
      })
    })
  })

  describe('testing blob path', () => {
    beforeEach(() => setup())

    it('renders CommitFileViewer', async () => {
      render(<CommitPageContent />, {
        wrapper: wrapper(
          '/gh/codecov/cool-repo/commit/sha256/blob/src/file.js'
        ),
      })

      const fileViewer = await screen.findByText('CommitFileViewer')
      expect(fileViewer).toBeInTheDocument()
    })
  })

  describe('testing base commit path', () => {
    beforeEach(() => setup())

    it('renders ImpactedFiles', async () => {
      render(<CommitPageContent />, {
        wrapper: wrapper('/gh/codecov/cool-repo/commit/sha256'),
      })

      const impactedFiles = await screen.findByText('ImpactedFiles')
      expect(impactedFiles).toBeInTheDocument()
    })
  })

  describe('testing random paths', () => {
    beforeEach(() => setup())

    it('redirects user to base commit route', async () => {
      render(<CommitPageContent />, {
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
})
