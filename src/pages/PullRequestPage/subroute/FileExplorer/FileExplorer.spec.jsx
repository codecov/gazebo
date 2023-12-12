import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import FileExplorer from './FileExplorer'

jest.mock('../ComponentsSelector', () => () => 'ComponentsSelector')

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
    pull: {
      head: {
        commitid: '123',
        pathContents: {
          results: [],
          __typename: 'PathContents',
        },
      },
    },
  },
}

const mockListData = {
  username: 'nicholas-codecov',
  repository: {
    pull: {
      head: {
        commitid: '123',
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
  },
}

const mockTreeData = {
  username: 'nicholas-codecov',
  repository: {
    pull: {
      head: {
        commitid: '123',
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
  },
}

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/pull/123/tree/a/b/c']) =>
  ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/pull/:pullId/tree/:path+">
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

describe('FileExplorer', () => {
  function setup(noFiles = false) {
    const user = userEvent.setup()
    const requestFilters = jest.fn()

    server.use(
      graphql.query('PullPathContents', (req, res, ctx) => {
        if (req.variables?.filters) {
          requestFilters(req.variables?.filters)
        }

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
        render(<FileExplorer />, { wrapper: wrapper() })

        const files = await screen.findByText('Files')
        expect(files).toBeInTheDocument()
      })

      it('has a tracked lines column', async () => {
        render(<FileExplorer />, { wrapper: wrapper() })

        const trackedLines = await screen.findByText('Tracked lines')
        expect(trackedLines).toBeInTheDocument()
      })

      it('has a covered column', async () => {
        render(<FileExplorer />, { wrapper: wrapper() })

        const covered = await screen.findByText('Covered')
        expect(covered).toBeInTheDocument()
      })

      it('has a partial column', async () => {
        render(<FileExplorer />, { wrapper: wrapper() })

        const partial = await screen.findByText('Partial')
        expect(partial).toBeInTheDocument()
      })

      it('has a missed column', async () => {
        render(<FileExplorer />, { wrapper: wrapper() })

        const missed = await screen.findByText('Missed')
        expect(missed).toBeInTheDocument()
      })

      it('has a coverage column', async () => {
        render(<FileExplorer />, { wrapper: wrapper() })

        const coverage = await screen.findByText('Coverage %')
        expect(coverage).toBeInTheDocument()
      })
    })

    describe('when rendered', () => {
      it('renders ComponentsSelector', async () => {
        setup()
        render(<FileExplorer />, { wrapper: wrapper() })

        const selector = await screen.findByText('ComponentsSelector')
        expect(selector).toBeInTheDocument()
      })
    })

    describe('table is displaying file tree', () => {
      describe('default sort is set', () => {
        it('sets default sort to name asc', async () => {
          const { requestFilters } = setup()
          render(<FileExplorer />, { wrapper: wrapper() })

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
          render(<FileExplorer />, { wrapper: wrapper() })

          expect(await screen.findByText('src')).toBeTruthy()
          const dir = screen.getByText('src')
          expect(dir).toBeInTheDocument()

          const table = await screen.findByRole('table')
          const links = await within(table).findAllByRole('link')
          expect(links[1]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/pull/123/tree/a/b/c/src'
          )
        })
      })

      describe('displaying a file', () => {
        it('has the correct url', async () => {
          setup()
          render(<FileExplorer />, { wrapper: wrapper() })

          expect(await screen.findByText('file.js')).toBeTruthy()
          const file = screen.getByText('file.js')
          expect(file).toBeInTheDocument()

          const table = await screen.findByRole('table')
          const links = await within(table).findAllByRole('link')
          expect(links[2]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/pull/123/blob/a/b/c/file.js'
          )
        })
      })
    })

    describe('table is displaying file list', () => {
      describe('display type is set', () => {
        it('set to list', async () => {
          const { requestFilters } = setup()
          render(<FileExplorer />, {
            wrapper: wrapper([
              '/gh/codecov/cool-repo/pull/123/tree/a/b/c?displayType=list',
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
          render(<FileExplorer />, {
            wrapper: wrapper([
              '/gh/codecov/cool-repo/pull/123/tree/a/b/c?displayType=list',
            ]),
          })

          expect(await screen.findByText('a/b/c/file.js')).toBeTruthy()
          const file = screen.getByText('a/b/c/file.js')
          expect(file).toBeInTheDocument()

          const table = await screen.findByRole('table')
          const links = await within(table).findAllByRole('link')
          expect(links[0]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/pull/123/blob/a/b/c/file.js'
          )
        })
      })
    })

    describe('there is no results found', () => {
      beforeEach(() => {
        setup(true)
      })

      it('displays error fetching data message', async () => {
        render(<FileExplorer />, { wrapper: wrapper() })

        const message = await screen.findByText(
          'There was a problem getting repo contents from your provider'
        )
        expect(message).toBeInTheDocument()
      })
    })
  })

  describe('sorting on head columns', () => {
    describe('sorting on head column', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          expect(await screen.findByText('Files')).toBeTruthy()
          let files = screen.getByText('Files')
          await user.click(files)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'NAME' },
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          expect(await screen.findByText('Files')).toBeTruthy()
          let files = screen.getByText('Files')
          await user.click(files)

          expect(await screen.findByText('Files')).toBeTruthy()
          files = screen.getByText('Files')
          await user.click(files)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'NAME' },
            })
          )
        })
      })
    })

    describe('sorting on tracked lines column', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          expect(await screen.findByText('Tracked lines')).toBeTruthy()
          const trackedLines = screen.getByText('Tracked lines')
          await user.click(trackedLines)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'LINES' },
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          expect(await screen.findByText('Tracked lines')).toBeTruthy()
          let trackedLines = screen.getByText('Tracked lines')
          await user.click(trackedLines)

          expect(await screen.findByText('Tracked lines')).toBeTruthy()
          trackedLines = screen.getByText('Tracked lines')
          await user.click(trackedLines)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'LINES' },
            })
          )
        })
      })
    })

    describe('sorting on the covered column', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          expect(await screen.findByText('Covered')).toBeTruthy()
          const covered = screen.getByText('Covered')
          await user.click(covered)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'HITS' },
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          expect(await screen.findByText('Covered')).toBeTruthy()
          let covered = screen.getByText('Covered')
          await user.click(covered)

          expect(await screen.findByText('Covered')).toBeTruthy()
          covered = screen.getByText('Covered')
          await user.click(covered)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'HITS' },
            })
          )
        })
      })
    })

    describe('sorting on the partial column', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          expect(await screen.findByText('Partial')).toBeTruthy()
          const partial = screen.getByText('Partial')
          await user.click(partial)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'PARTIALS' },
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          expect(await screen.findByText('Partial')).toBeTruthy()
          let partial = screen.getByText('Partial')
          await user.click(partial)

          expect(await screen.findByText('Partial')).toBeTruthy()
          partial = screen.getByText('Partial')
          await user.click(partial)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'PARTIALS' },
            })
          )
        })
      })
    })

    describe('sorting on the coverage line', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          expect(await screen.findByText('Missed')).toBeTruthy()
          const missed = screen.getByText('Missed')
          await user.click(missed)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'MISSES' },
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          expect(await screen.findByText('Missed')).toBeTruthy()
          let missed = screen.getByText('Missed')
          await user.click(missed)

          expect(await screen.findByText('Missed')).toBeTruthy()
          missed = screen.getByText('Missed')
          await user.click(missed)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'MISSES' },
            })
          )
        })
      })
    })
  })

  describe('searching on the table', () => {
    describe('api variables are being set', () => {
      it('sets the correct api variables', async () => {
        const { requestFilters, user } = setup()
        render(<FileExplorer />, { wrapper: wrapper() })

        expect(
          await await screen.findByRole('textbox', {
            name: 'Search for files',
          })
        ).toBeTruthy()
        const search = screen.getByRole('textbox', {
          name: 'Search for files',
        })
        await user.type(search, 'cool-file.rs')

        await waitFor(() =>
          expect(requestFilters).toHaveBeenCalledWith({
            searchValue: 'cool-file.rs',
            ordering: { direction: 'ASC', parameter: 'NAME' },
          })
        )
      })
    })

    describe('there are no files to be found', () => {
      it('displays no items found message', async () => {
        const { user } = setup()
        render(<FileExplorer />, { wrapper: wrapper() })

        expect(await screen.findByText('src')).toBeTruthy()
        const dir = screen.getByText('src')
        expect(dir).toBeInTheDocument()

        expect(
          await screen.findByRole('textbox', {
            name: 'Search for files',
          })
        ).toBeTruthy()
        const search = screen.getByRole('textbox', {
          name: 'Search for files',
        })
        await user.type(search, 'cool-file.rs')

        expect(await screen.findByText(/no results found/i)).toBeTruthy()
        const noResults = screen.getByText(/no results found/i)
        expect(noResults).toBeInTheDocument()
      })
    })
  })
})
