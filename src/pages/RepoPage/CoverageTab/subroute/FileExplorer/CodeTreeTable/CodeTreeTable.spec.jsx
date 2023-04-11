import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CodeTreeTable from './CodeTreeTable'

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
    branch: {
      head: {
        pathContents: {
          results: [],
          __typename: 'PathContents',
        },
      },
    },
  },
}

const mockTreeData = {
  username: 'nicholas-codecov',
  repository: {
    branch: {
      head: {
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

const mockNoHeadReport = {
  username: 'nicholas-codecov',
  repository: {
    branch: {
      head: {
        pathContents: {
          results: [],
        },
        __typename: 'MissingHeadReport',
      },
    },
  },
}

const mockOverview = {
  owner: { repository: { private: false, defaultBranch: 'main' } },
}

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/tree/main/a/b/c']) =>
  ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
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

describe('CodeTreeTable', () => {
  function setup(noFiles = false, noHeadReport = false) {
    const user = userEvent.setup()
    const requestFilters = jest.fn()

    server.use(
      graphql.query('BranchContents', (req, res, ctx) => {
        if (req.variables?.filters) {
          requestFilters(req.variables?.filters)
        }

        if (noHeadReport) {
          return res(ctx.status(200), ctx.data({ owner: mockNoHeadReport }))
        }

        if (noFiles || req.variables?.filters?.searchValue) {
          return res(ctx.status(200), ctx.data({ owner: mockNoFiles }))
        }

        return res(ctx.status(200), ctx.data({ owner: mockTreeData }))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockOverview))
      })
    )

    return { requestFilters, user }
  }

  describe('rendering table', () => {
    describe('displaying the table head', () => {
      beforeEach(() => setup())

      it('has a files column', async () => {
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const files = await screen.findByText('Files')
        expect(files).toBeInTheDocument()
      })

      it('has a tracked lines column', async () => {
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const trackedLines = await screen.findByText('Tracked lines')
        expect(trackedLines).toBeInTheDocument()
      })

      it('has a covered column', async () => {
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const covered = await screen.findByText('Covered')
        expect(covered).toBeInTheDocument()
      })

      it('has a partial column', async () => {
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const partial = await screen.findByText('Partial')
        expect(partial).toBeInTheDocument()
      })

      it('has a missed column', async () => {
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const missed = await screen.findByText('Missed')
        expect(missed).toBeInTheDocument()
      })

      it('has a coverage column', async () => {
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const coverage = await screen.findByText('Coverage %')
        expect(coverage).toBeInTheDocument()
      })
    })

    describe('table is displaying file tree', () => {
      describe('default sort is set', () => {
        it('sets default sort to name asc', async () => {
          const { requestFilters } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          await waitFor(() =>
            expect(requestFilters).toBeCalledWith({
              ordering: { direction: 'ASC', parameter: 'NAME' },
            })
          )
        })
      })

      describe('displaying a directory', () => {
        beforeEach(() => setup())

        it('has the correct url', async () => {
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const dir = await screen.findByText('src')
          expect(dir).toBeInTheDocument()

          const links = await within(
            await screen.findByRole('table')
          ).findAllByRole('link')
          expect(links[1]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/tree/main/a/b/c/src'
          )
        })
      })

      describe('displaying a file', () => {
        beforeEach(() => setup())

        it('has the correct url', async () => {
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const file = await screen.findByText('file.js')
          expect(file).toBeInTheDocument()

          const links = await within(
            await screen.findByRole('table')
          ).findAllByRole('link')
          expect(links[2]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/blob/main/a/b/c/file.js'
          )
        })
      })
    })

    describe('there is no results found', () => {
      beforeEach(() => {
        setup(true)
      })

      it('displays error fetching data message', async () => {
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const message = await screen.findByText(
          'There was a problem getting repo contents from your provider'
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('when head commit has no reports', () => {
      beforeEach(() => {
        setup(false, true)
      })

      it('renders no report uploaded message', async () => {
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const message = await screen.findByText(
          'No coverage report uploaded for this branch head commit'
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

          render(<CodeTreeTable />, { wrapper: wrapper() })

          let files = await screen.findByText('Files')
          await user.click(files)

          expect(requestFilters).toHaveBeenCalledWith({
            ordering: { direction: 'ASC', parameter: 'NAME' },
          })
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

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
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const trackedLines = await screen.findByText('Tracked lines')

          await user.click(trackedLines)
          await user.click(trackedLines)

          expect(requestFilters).toHaveBeenCalledWith({
            ordering: { direction: 'ASC', parameter: 'LINES' },
          })
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

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
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const covered = await screen.findByText('Covered')
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
          render(<CodeTreeTable />, { wrapper: wrapper() })

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
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const partial = await screen.findByText('Partial')

          await user.click(partial)
          await user.click(partial)

          expect(requestFilters).toHaveBeenCalledWith({
            ordering: { direction: 'ASC', parameter: 'PARTIALS' },
          })
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

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
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const missed = await screen.findByText('Missed')
          await user.click(missed)
          await user.click(missed)

          expect(requestFilters).toHaveBeenCalledWith({
            ordering: { direction: 'ASC', parameter: 'MISSES' },
          })
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

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
})
