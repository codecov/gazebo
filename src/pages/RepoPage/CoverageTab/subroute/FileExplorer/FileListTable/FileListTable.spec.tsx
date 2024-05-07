import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { MemoryRouter, Route } from 'react-router-dom'

import FileListTable from './FileListTable'

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
    __typename: 'Repository',
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

const mockUnknownPath = {
  username: 'nicholas-codecov',
  repository: {
    __typename: 'Repository',
    branch: {
      head: {
        pathContents: {
          results: [],
          __typename: 'UnknownPath',
        },
      },
    },
  },
}

const mockMissingCoverage = {
  username: 'nicholas-codecov',
  repository: {
    __typename: 'Repository',
    branch: {
      head: {
        pathContents: {
          results: [],
          __typename: 'MissingCoverage',
        },
      },
    },
  },
}

const mockListData = {
  username: 'nicholas-codecov',
  repository: {
    __typename: 'Repository',
    branch: {
      head: {
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
              isCriticalFile: false,
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
    __typename: 'Repository',
    branch: {
      head: {
        pathContents: {
          __typename: 'MissingHeadReport',
          results: [],
        },
      },
    },
  },
}

const mockOverview = {
  owner: {
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: [],
    },
  },
}

const wrapper =
  (
    initialEntries = '/gh/codecov/cool-repo/tree/main/a/b/c'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider/:owner/:repo/tree/:branch/:path*">
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

describe('FileListTable', () => {
  function setup({
    noFiles = false,
    noHeadReport = false,
    noFlagCoverage = false,
    missingCoverage = false,
    unknownPath = false,
  }) {
    const user = userEvent.setup({})
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

        if (missingCoverage) {
          return res(ctx.status(200), ctx.data({ owner: mockMissingCoverage }))
        }

        if (unknownPath) {
          return res(ctx.status(200), ctx.data({ owner: mockUnknownPath }))
        }

        return res(ctx.status(200), ctx.data({ owner: mockListData }))
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
        setup({})
        render(<FileListTable />, { wrapper: wrapper() })

        const files = await screen.findByText('Files')
        expect(files).toBeInTheDocument()
      })

      it('has a tracked lines column', async () => {
        setup({})
        render(<FileListTable />, { wrapper: wrapper() })

        const trackedLines = await screen.findByText('Tracked lines')
        expect(trackedLines).toBeInTheDocument()
      })

      it('has a covered column', async () => {
        setup({})
        render(<FileListTable />, { wrapper: wrapper() })

        const covered = await screen.findByText('Covered')
        expect(covered).toBeInTheDocument()
      })

      it('has a partial column', async () => {
        setup({})
        render(<FileListTable />, { wrapper: wrapper() })

        const partial = await screen.findByText('Partial')
        expect(partial).toBeInTheDocument()
      })

      it('has a missed column', async () => {
        setup({})
        render(<FileListTable />, { wrapper: wrapper() })

        const missed = await screen.findByText('Missed')
        expect(missed).toBeInTheDocument()
      })

      it('has a coverage column', async () => {
        setup({})
        render(<FileListTable />, { wrapper: wrapper() })

        const coverage = await screen.findByText('Coverage %')
        expect(coverage).toBeInTheDocument()
      })
    })

    describe('table is displaying file list', () => {
      describe('display type is set', () => {
        it('set to list', async () => {
          const { requestFilters } = setup({})
          render(<FileListTable />, {
            wrapper: wrapper(
              `/gh/codecov/cool-repo/tree/main/a/b/c${qs.stringify(
                { displayType: 'list' },
                { addQueryPrefix: true }
              )}`
            ),
          })

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                displayType: 'LIST',
                ordering: { direction: 'DESC', parameter: 'MISSES' },
              })
            )
          )
        })
      })

      describe('displaying a file', () => {
        it('has the correct url', async () => {
          setup({})
          render(<FileListTable />, {
            wrapper: wrapper(
              `/gh/codecov/cool-repo/tree/main/a/b/c${qs.stringify(
                { displayType: 'list' },
                { addQueryPrefix: true }
              )}`
            ),
          })

          const links = await within(
            await screen.findByRole('table')
          ).findAllByRole('link')
          expect(links[0]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/blob/main/a%2Fb%2Fc%2Ffile.js'
          )
        })
      })
    })

    describe('there is no results found', () => {
      it('displays error fetching data message', async () => {
        setup({ noFiles: true })
        render(<FileListTable />, {
          wrapper: wrapper('/gh/codecov/cool-repo/tree/main/'),
        })

        const message = await screen.findByText(
          'Once merged to your default branch, Codecov will show your report results on this dashboard.'
        )
        expect(message).toBeInTheDocument()

        const link = await screen.findByTestId('settings-page')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/gh/codecov/cool-repo/settings')
      })
    })

    describe('when head commit has no reports', () => {
      it('renders no report uploaded message', async () => {
        setup({ noHeadReport: true })
        render(<FileListTable />, {
          wrapper: wrapper('/gh/codecov/cool-repo/tree/main'),
        })

        const message = await screen.findByText(
          'No coverage report uploaded for this branch head commit'
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('when there is no flag coverage', () => {
      it('renders no flag coverage message', async () => {
        setup({ noFlagCoverage: true })
        render(<FileListTable />, {
          wrapper: wrapper(
            `/gh/codecov/cool-repo/tree/main/a/b/c${qs.stringify(
              { displayType: 'list', flags: ['flag-1'] },
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

    describe('when branch contents returns unknown path', () => {
      it('renders unknown path message', async () => {
        setup({ missingCoverage: true })
        render(<FileListTable />, {
          wrapper: wrapper(
            `/gh/codecov/cool-repo/tree/main/a/b/c${qs.stringify(
              { displayType: 'list', flags: ['flag-1'] },
              { addQueryPrefix: true }
            )}`
          ),
        })

        const message = await screen.findByText('No coverage data available.')
        expect(message).toBeInTheDocument()
      })
    })

    describe('branch contents has missing coverage', () => {
      it('renders the missing coverage message', async () => {
        setup({ unknownPath: true })
        render(<FileListTable />, {
          wrapper: wrapper(
            `/gh/codecov/cool-repo/tree/main/a/b/c${qs.stringify(
              { displayType: 'list', flags: ['flag-1'] },
              { addQueryPrefix: true }
            )}`
          ),
        })

        const message = await screen.findByText(
          'Unknown filepath. Please ensure that files/directories exist and are not empty.'
        )
        expect(message).toBeInTheDocument()
      })
    })
  })

  describe('sorting on head columns', () => {
    describe('sorting on head column', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})

          render(<FileListTable />, { wrapper: wrapper() })

          let files = await screen.findByText('Files')
          await user.click(files)
          await user.click(files)

          expect(requestFilters).toHaveBeenCalledWith(
            expect.objectContaining({
              ordering: { direction: 'ASC', parameter: 'NAME' },
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})
          render(<FileListTable />, { wrapper: wrapper() })

          let files = await screen.findByText('Files')
          await user.click(files)
          files = await screen.findByText('Files')
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
          const { requestFilters, user } = setup({})
          render(<FileListTable />, { wrapper: wrapper() })

          let trackedLines = await screen.findByText('Tracked lines')
          await user.click(trackedLines)

          trackedLines = await screen.findByText('Tracked lines')
          await user.click(trackedLines)

          expect(requestFilters).toHaveBeenCalledWith(
            expect.objectContaining({
              ordering: { direction: 'ASC', parameter: 'LINES' },
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})
          render(<FileListTable />, { wrapper: wrapper() })

          let trackedLines = await screen.findByText('Tracked lines')
          await user.click(trackedLines)

          trackedLines = await screen.findByText('Tracked lines')
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
          const { requestFilters, user } = setup({})
          render(<FileListTable />, { wrapper: wrapper() })

          const covered = await screen.findByText('Covered')
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
          const { requestFilters, user } = setup({})
          render(<FileListTable />, { wrapper: wrapper() })

          let covered = await screen.findByText('Covered')
          await user.click(covered)

          covered = await screen.findByText('Covered')
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
          const { requestFilters, user } = setup({})
          render(<FileListTable />, { wrapper: wrapper() })

          let partial = await screen.findByText('Partial')
          await user.click(partial)

          partial = await screen.findByText('Partial')
          await user.click(partial)

          expect(requestFilters).toHaveBeenCalledWith(
            expect.objectContaining({
              ordering: { direction: 'ASC', parameter: 'PARTIALS' },
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})
          render(<FileListTable />, { wrapper: wrapper() })

          let partial = await screen.findByText('Partial')
          await user.click(partial)

          partial = await screen.findByText('Partial')
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

    describe('sorting on the misses line', () => {
      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})
          render(<FileListTable />, { wrapper: wrapper() })

          let missed = await screen.findByText('Missed')
          await user.click(missed)
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

    describe('sorting on the coverage line', () => {
      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})
          render(<FileListTable />, { wrapper: wrapper() })

          expect(await screen.findByText('Coverage %')).toBeTruthy()
          const coverage = screen.getByText('Coverage %')
          await user.click(coverage)
          await user.click(coverage)
          expect(requestFilters).toHaveBeenCalledWith(
            expect.objectContaining({
              ordering: { direction: 'DESC', parameter: 'COVERAGE' },
            })
          )
        })
      })

      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})
          render(<FileListTable />, { wrapper: wrapper() })
          expect(await screen.findByText('Coverage %')).toBeTruthy()
          let coverage = screen.getByText('Coverage %')
          await user.click(coverage)
          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'ASC', parameter: 'COVERAGE' },
              })
            )
          })
        })
      })
    })
  })
})
