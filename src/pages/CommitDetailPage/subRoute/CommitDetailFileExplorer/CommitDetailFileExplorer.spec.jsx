import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitDetailFileExplorer from './CommitDetailFileExplorer'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

const mockNoFiles = {
  username: 'nicholas-codecov',
  repository: {
    commit: {
      pathContents: {
        results: [],
        __typename: 'PathContents',
      },
    },
  },
}

const mockListData = {
  username: 'nicholas-codecov',
  repository: {
    commit: {
      pathContents: {
        results: [
          {
            __typename: 'PathContentFile',
            hits: 9,
            misses: 0,
            partials: 0,
            lines: 10,
            name: 'file.js',
            path: 'a/b/c/file.js',
            percentCovered: 100.0,
          },
        ],
        __typename: 'PathContents',
      },
    },
  },
}

const mockTreeData = {
  username: 'nicholas-codecov',
  repository: {
    commit: {
      pathContents: {
        results: [
          {
            __typename: 'PathContentDir',
            hits: 9,
            misses: 0,
            partials: 0,
            lines: 10,
            name: 'src',
            path: 'src',
            percentCovered: 100.0,
          },
          {
            __typename: 'PathContentFile',
            hits: 9,
            misses: 0,
            partials: 0,
            lines: 10,
            name: 'file.js',
            path: 'a/b/c/file.js',
            percentCovered: 100.0,
          },
        ],
        __typename: 'PathContents',
      },
    },
  },
}

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/commit/sha256/tree/a/b/c']) =>
  ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/commit/:commit/tree/:path+">
            {children}
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

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

describe('CommitDetailFileExplorer', () => {
  function setup(noFiles = false) {
    const user = userEvent.setup()
    const requestFilters = jest.fn()

    server.use(
      graphql.query('CommitPathContents', (req, res, ctx) => {
        requestFilters(req.variables.filters)

        if (noFiles || req.variables?.filters?.searchValue) {
          return res(ctx.status(200), ctx.data({ owner: mockNoFiles }))
        }

        if (
          req.variables?.filters?.displayType &&
          req.variables?.filters?.displayType === 'LIST'
        ) {
          return res(ctx.status(200), ctx.data({ owner: mockListData }))
        }

        return res(ctx.status(200), ctx.data({ owner: mockTreeData }))
      })
    )

    return { requestFilters, user }
  }

  describe('rendering table', () => {
    describe('displaying the table head', () => {
      beforeEach(() => setup())

      it('has a files column', async () => {
        render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

        const files = await screen.findByText('Files')
        expect(files).toBeInTheDocument()
      })

      it('has a tracked lines column', async () => {
        render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

        const trackedLines = await screen.findByText('Tracked lines')
        expect(trackedLines).toBeInTheDocument()
      })

      it('has a covered column', async () => {
        render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

        const covered = await screen.findByText('Covered')
        expect(covered).toBeInTheDocument()
      })

      it('has a partial column', async () => {
        render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

        const partial = await screen.findByText('Partial')
        expect(partial).toBeInTheDocument()
      })

      it('has a missed column', async () => {
        render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

        const missed = await screen.findByText('Missed')
        expect(missed).toBeInTheDocument()
      })

      it('has a coverage column', async () => {
        render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

        const coverage = await screen.findByText('Coverage %')
        expect(coverage).toBeInTheDocument()
      })
    })

    describe('table is displaying file tree', () => {
      describe('default sort is set', () => {
        it('sets default sort to name asc', async () => {
          const { requestFilters } = setup()
          render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

          await waitFor(() =>
            expect(requestFilters).toBeCalledWith({
              ordering: { direction: 'ASC', parameter: 'NAME' },
            })
          )
        })
      })

      describe('displaying a directory', () => {
        it('has the correct url', async () => {
          setup()
          render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

          const dir = await screen.findByText('src')
          expect(dir).toBeInTheDocument()

          const links = await within(
            await screen.findByRole('table')
          ).findAllByRole('link')
          expect(links[1]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/commit/sha256/tree/a/b/c/src'
          )
        })
      })

      describe('displaying a file', () => {
        it('has the correct url', async () => {
          setup()
          render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

          const file = await screen.findByText('file.js')
          expect(file).toBeInTheDocument()

          const links = await within(
            await screen.findByRole('table')
          ).findAllByRole('link')
          expect(links[2]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/commit/sha256/blob/a/b/c/file.js'
          )
        })
      })
    })

    describe('table is displaying file list', () => {
      describe('display type is set', () => {
        it('set to list', async () => {
          const { requestFilters } = setup()
          render(<CommitDetailFileExplorer />, {
            wrapper: wrapper([
              '/gh/codecov/cool-repo/commit/sha256/tree/a/b/c?displayType=list',
            ]),
          })

          await waitFor(() =>
            expect(requestFilters).toBeCalledWith({
              displayType: 'LIST',
              ordering: { direction: 'DESC', parameter: 'MISSES' },
            })
          )
        })
      })

      describe('displaying a file', () => {
        it('has the correct url', async () => {
          setup()
          render(<CommitDetailFileExplorer />, {
            wrapper: wrapper([
              '/gh/codecov/cool-repo/commit/sha256/tree/a/b/c?displayType=list',
            ]),
          })

          const file = await screen.findByText('a/b/c/file.js')
          expect(file).toBeInTheDocument()

          const links = await within(
            await screen.findByRole('table')
          ).findAllByRole('link')
          expect(links[0]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/commit/sha256/blob/a/b/c/file.js'
          )
        })
      })
    })

    describe('there is no results found', () => {
      beforeEach(() => setup(true))

      it('displays error fetching data message', async () => {
        render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

        const message = await screen.findByText(
          'There was a problem getting repo contents from your provider'
        )
        expect(message).toBeInTheDocument()
      })
    })
  })

  describe('sorting on head columns', () => {
    describe('sorting on name column', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { user, requestFilters } = setup()
          render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

          const files = await screen.findByText('Files')
          await user.click(files)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'NAME' },
            })
          })
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { user, requestFilters } = setup()
          render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

          let files = await screen.findByText('Files')
          await user.click(files)
          files = await screen.findByText('Files')
          await user.click(files)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'NAME' },
            })
          })
        })
      })
    })

    describe('sorting on tracked lines column', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { user, requestFilters } = setup()
          render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

          const trackedLines = await screen.findByText('Tracked lines')
          await user.click(trackedLines)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'LINES' },
            })
          })
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { user, requestFilters } = setup()
          render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

          let trackedLines = await screen.findByText('Tracked lines')
          await user.click(trackedLines)
          trackedLines = await screen.findByText('Tracked lines')
          await user.click(trackedLines)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'LINES' },
            })
          })
        })
      })
    })

    describe('sorting on the covered column', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { user, requestFilters } = setup()
          render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

          const covered = await screen.findByText('Covered')

          await user.click(covered)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'HITS' },
            })
          })
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { user, requestFilters } = setup()
          render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

          let covered = await screen.findByText('Covered')
          await user.click(covered)
          covered = await screen.findByText('Covered')
          await user.click(covered)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'HITS' },
            })
          })
        })
      })
    })

    describe('sorting on the partial column', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { user, requestFilters } = setup()
          render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

          const partial = await screen.findByText('Partial')

          await user.click(partial)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'PARTIALS' },
            })
          })
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { user, requestFilters } = setup()
          render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

          let partial = await screen.findByText('Partial')
          await user.click(partial)
          partial = await screen.findByText('Partial')
          await user.click(partial)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'PARTIALS' },
            })
          })
        })
      })
    })

    describe('sorting on the coverage line', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { user, requestFilters } = setup()
          render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

          const missed = await screen.findByText('Missed')

          await user.click(missed)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'MISSES' },
            })
          })
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { user, requestFilters } = setup()
          render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

          let missed = await screen.findByText('Missed')
          await user.click(missed)
          missed = await screen.findByText('Missed')
          await user.click(missed)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'MISSES' },
            })
          })
        })
      })
    })
  })

  describe('searching on the table', () => {
    describe('api variables are being set', () => {
      it('sets the correct api variables', async () => {
        const { user, requestFilters } = setup()
        render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

        const search = await screen.findByRole('textbox', {
          name: 'Search for files',
        })
        await user.type(search, 'cool-file.rs')

        await waitFor(() => {
          expect(requestFilters).toHaveBeenCalledWith({
            searchValue: 'cool-file.rs',
            ordering: { direction: 'ASC', parameter: 'NAME' },
          })
        })
      })
    })

    describe('there are no files to be found', () => {
      beforeEach(() => setup())
      it('displays no items found message', async () => {
        const { user } = setup()
        render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

        const dir = await screen.findByText('src')
        expect(dir).toBeInTheDocument()

        const search = await screen.findByRole('textbox', {
          name: 'Search for files',
        })
        await user.type(search, 'cool-file.rs')

        const noResults = await screen.findByText(/no results found/i)
        expect(noResults).toBeInTheDocument()
      })
    })
  })
})
