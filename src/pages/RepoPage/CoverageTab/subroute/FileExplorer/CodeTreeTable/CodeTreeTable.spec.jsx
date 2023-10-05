import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
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
  (initialEntries = '/gh/codecov/cool-repo/tree/main/a/b/c') =>
  ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
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
  function setup(
    { noFiles = false, noHeadReport = false, noFlagCoverage = false } = {
      noFiles: false,
      noHeadReport: false,
      noFlagCoverage: false,
    }
  ) {
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

        if (noFlagCoverage) {
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
      it('has a files column', async () => {
        setup()
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const files = await screen.findByText('Files')
        expect(files).toBeInTheDocument()
      })

      it('has a tracked lines column', async () => {
        setup()
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const trackedLines = await screen.findByText('Tracked lines')
        expect(trackedLines).toBeInTheDocument()
      })

      it('has a covered column', async () => {
        setup()
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const covered = await screen.findByText('Covered')
        expect(covered).toBeInTheDocument()
      })

      it('has a partial column', async () => {
        setup()
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const partial = await screen.findByText('Partial')
        expect(partial).toBeInTheDocument()
      })

      it('has a missed column', async () => {
        setup()
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const missed = await screen.findByText('Missed')
        expect(missed).toBeInTheDocument()
      })

      it('has a coverage column', async () => {
        setup()
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
            expect(queryClient.isFetching()).toBeGreaterThan(0)
          )
          await waitFor(() => expect(queryClient.isFetching()).toBe(0))

          await waitFor(() =>
            expect(requestFilters).toBeCalledWith(
              expect.objectContaining({
                ordering: { direction: 'ASC', parameter: 'NAME' },
              })
            )
          )
        })
      })

      describe('displaying a directory', () => {
        it('has the correct url', async () => {
          setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          expect(await screen.findByText('src')).toBeTruthy()
          const dir = screen.getByText('src')
          expect(dir).toBeInTheDocument()

          const table = await screen.findByRole('table')
          const links = await within(table).findAllByRole('link')

          expect(links[1]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/tree/main/a%2Fb%2Fc%2Fsrc'
          )
        })
      })

      describe('displaying a file', () => {
        it('has the correct url', async () => {
          setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          expect(await screen.findByText('file.js')).toBeTruthy()
          const file = screen.getByText('file.js')
          expect(file).toBeInTheDocument()

          const table = await screen.findByRole('table')
          const links = await within(table).findAllByRole('link')

          expect(links[2]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/blob/main/a%2Fb%2Fc%2Ffile.js'
          )
        })
      })
    })

    describe('there is no results found', () => {
      it('displays error fetching data message', async () => {
        setup({ noFiles: true })
        render(<CodeTreeTable />, { wrapper: wrapper() })

        expect(
          await screen.findByText(
            'There was a problem getting repo contents from your provider'
          )
        ).toBeTruthy()
        const message = screen.getByText(
          'There was a problem getting repo contents from your provider'
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('when head commit has no reports', () => {
      it('renders no report uploaded message', async () => {
        setup({ noHeadReport: true })
        render(<CodeTreeTable />, { wrapper: wrapper() })

        expect(
          await screen.findByText(
            'No coverage report uploaded for this branch head commit'
          )
        ).toBeTruthy()
        const message = screen.getByText(
          'No coverage report uploaded for this branch head commit'
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('when flags are selected with no coverage', () => {
      it('renders no flag coverage message', async () => {
        setup({ noFlagCoverage: true })
        render(<CodeTreeTable />, {
          wrapper: wrapper(
            `/gh/codecov/cool-repo/tree/main/a/b/c${qs.stringify(
              { flags: ['flag-1'] },
              { addQueryPrefix: true }
            )}`
          ),
        })

        const message = await screen.findByText(
          "No coverage report uploaded for the selected flags in this branch's head commit"
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

          expect(await screen.findByText('Files')).toBeTruthy()
          const files = screen.getByText('Files')
          await user.click(files)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'ASC', parameter: 'NAME' },
              })
            )
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          expect(await screen.findByText('Files')).toBeTruthy()
          let files = screen.getByText('Files')
          await user.click(files)

          expect(await screen.findByText('Files')).toBeTruthy()
          files = screen.getByText('Files')
          await user.click(files)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'DESC', parameter: 'NAME' },
              })
            )
          })
        })
      })
    })

    describe('sorting on tracked lines column', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          expect(await screen.findByText('Tracked lines')).toBeTruthy()
          const trackedLines = screen.getByText('Tracked lines')
          await user.click(trackedLines)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'ASC', parameter: 'LINES' },
              })
            )
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          expect(await screen.findByText('Tracked lines')).toBeTruthy()
          let trackedLines = screen.getByText('Tracked lines')
          await user.click(trackedLines)

          expect(await screen.findByText('Tracked lines')).toBeTruthy()
          trackedLines = screen.getByText('Tracked lines')
          await user.click(trackedLines)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'DESC', parameter: 'LINES' },
              })
            )
          })
        })
      })
    })

    describe('sorting on the covered column', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          expect(await screen.findByText('Covered')).toBeTruthy()
          const covered = screen.getByText('Covered')
          await user.click(covered)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'ASC', parameter: 'HITS' },
              })
            )
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          expect(await screen.findByText('Covered')).toBeTruthy()
          let covered = screen.getByText('Covered')
          await user.click(covered)

          expect(await screen.findByText('Covered')).toBeTruthy()
          covered = screen.getByText('Covered')
          await user.click(covered)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'DESC', parameter: 'HITS' },
              })
            )
          })
        })
      })
    })

    describe('sorting on the partial column', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          expect(await screen.findByText('Partial')).toBeTruthy()
          const partial = screen.getByText('Partial')
          await user.click(partial)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'ASC', parameter: 'PARTIALS' },
              })
            )
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          expect(await screen.findByText('Partial')).toBeTruthy()
          let partial = screen.getByText('Partial')
          await user.click(partial)

          expect(await screen.findByText('Partial')).toBeTruthy()
          partial = screen.getByText('Partial')
          await user.click(partial)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'DESC', parameter: 'PARTIALS' },
              })
            )
          })
        })
      })
    })

    describe('sorting on the coverage line', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          expect(await screen.findByText('Missed')).toBeTruthy()
          const missed = screen.getByText('Missed')
          await user.click(missed)

          expect(requestFilters).toHaveBeenCalledWith(
            expect.objectContaining({
              ordering: { direction: 'ASC', parameter: 'MISSES' },
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()
          render(<CodeTreeTable />, { wrapper: wrapper() })

          expect(await screen.findByText('Missed')).toBeTruthy()
          let missed = screen.getByText('Missed')
          await user.click(missed)

          expect(await screen.findByText('Missed')).toBeTruthy()
          missed = screen.getByText('Missed')
          await user.click(missed)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'DESC', parameter: 'MISSES' },
              })
            )
          })
        })
      })
    })
  })
})
