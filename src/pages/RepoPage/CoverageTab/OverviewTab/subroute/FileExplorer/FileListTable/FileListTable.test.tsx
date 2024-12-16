import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { mockIsIntersecting } from 'react-intersection-observer/test-utils'
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
  owner: {
    username: 'cool-codecov',
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          deprecatedPathContents: {
            __typename: 'PathContentConnection',
            edges: [],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          },
        },
      },
    },
  },
}

const mockUnknownPath = {
  owner: {
    username: 'cool-codecov',
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          deprecatedPathContents: {
            __typename: 'UnknownPath',
            message:
              'Unknown filepath. Please ensure that files/directories exist and are not empty.',
          },
        },
      },
    },
  },
}

const mockMissingCoverage = {
  owner: {
    username: 'cool-codecov',
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          deprecatedPathContents: {
            __typename: 'MissingCoverage',
            message: 'No coverage data available.',
          },
        },
      },
    },
  },
}
const node1 = {
  __typename: 'PathContentFile',
  hits: 9,
  misses: 0,
  partials: 0,
  lines: 10,
  name: 'file1.js',
  path: 'a/b/c/file.js',
  percentCovered: 100.0,
  isCriticalFile: false,
}

const node2 = {
  __typename: 'PathContentFile',
  hits: 5,
  misses: 2,
  partials: 1,
  lines: 8,
  name: 'file2.js',
  path: 'a/b/c/test.js',
  percentCovered: 62.5,
  isCriticalFile: false,
}

const node3 = {
  __typename: 'PathContentFile',
  hits: 15,
  misses: 5,
  partials: 0,
  lines: 20,
  name: 'file3.js',
  path: 'a/b/c/index.js',
  percentCovered: 75.0,
  isCriticalFile: true,
}

const mockListData = (after = false) => ({
  owner: {
    username: 'cool-codecov',
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          deprecatedPathContents: {
            __typename: 'PathContentConnection',
            edges: after
              ? [{ node: node3 }]
              : [{ node: node1 }, { node: node2 }],
            pageInfo: {
              hasNextPage: after ? false : true,
              endCursor: after
                ? 'aa'
                : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
            },
          },
        },
      },
    },
  },
})

const mockNoHeadReport = {
  owner: {
    username: 'cool-codecov',
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          deprecatedPathContents: {
            __typename: 'MissingHeadReport',
            message: 'No coverage report uploaded for this branch head commit',
          },
        },
      },
    },
  },
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
      testAnalyticsEnabled: true,
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
    const requestFilters = vi.fn()

    server.use(
      graphql.query('BranchContents', (info) => {
        if (info.variables?.filters) {
          requestFilters(info.variables?.filters)
        }

        if (noHeadReport) {
          return HttpResponse.json({ data: mockNoHeadReport })
        } else if (noFiles || info?.variables?.filters?.searchValue) {
          return HttpResponse.json({ data: mockNoFiles })
        } else if (noFlagCoverage) {
          return HttpResponse.json({ data: mockNoFiles })
        } else if (missingCoverage) {
          return HttpResponse.json({ data: mockMissingCoverage })
        } else if (unknownPath) {
          return HttpResponse.json({ data: mockUnknownPath })
        }

        return HttpResponse.json({ data: mockListData(info.variables.after) })
      }),
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: mockOverview })
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

          const files = await screen.findByText('Files')
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

          const files = await screen.findByText('Files')
          await user.click(files)
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

          const trackedLines = await screen.findByText('Tracked lines')
          await user.click(trackedLines)
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

          const trackedLines = await screen.findByText('Tracked lines')
          await user.click(trackedLines)
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

          const covered = await screen.findByText('Covered')
          await user.click(covered)
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

          const partial = await screen.findByText('Partial')
          await user.click(partial)
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

          const partial = await screen.findByText('Partial')
          await user.click(partial)
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

          const missed = await screen.findByText('Missed')
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

          const coverage = await screen.findByText('Coverage %')
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
          const coverage = await screen.findByText('Coverage %')
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

  describe('testing pagination', () => {
    it('displays the first page', async () => {
      setup({})
      render(<FileListTable />, { wrapper: wrapper() })
      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const page1File1 = await screen.findByText('file1.js')
      expect(page1File1).toBeInTheDocument()

      const page1File2 = await screen.findByText('file2.js')
      expect(page1File2).toBeInTheDocument()
    })

    it('displays the second page', async () => {
      setup({})
      render(<FileListTable />, { wrapper: wrapper() })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, true)

      const page2File1 = await screen.findByText('file3.js')
      expect(page2File1).toBeInTheDocument()
    })
  })
})
