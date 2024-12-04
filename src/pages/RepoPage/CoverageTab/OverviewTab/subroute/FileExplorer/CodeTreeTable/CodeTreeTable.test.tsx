import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
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
  owner: {
    username: 'nicholas-codecov',
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

const mockMissingCoverage = {
  owner: {
    username: 'nicholas-codecov',
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

const mockUnknownPath = {
  owner: {
    username: 'nicholas-codecov',
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

const mockTreeData = {
  owner: {
    username: 'codecov-tree',
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
            edges: [
              {
                node: {
                  __typename: 'PathContentDir',
                  hits: 9,
                  misses: 0,
                  partials: 0,
                  lines: 10,
                  name: 'src',
                  path: 'src',
                  percentCovered: 100.0,
                },
              },
            ],
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

const mockDataMultipleRows = {
  owner: {
    username: 'codecov-tree',
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
            edges: [
              {
                node: {
                  __typename: 'PathContentDir',
                  hits: 9,
                  misses: 0,
                  partials: 0,
                  lines: 10,
                  name: 'src',
                  path: 'src',
                  percentCovered: 100.0,
                },
              },
              {
                node: {
                  __typename: 'PathContentDir',
                  hits: 9,
                  misses: 2,
                  partials: 1,
                  lines: 999,
                  name: 'tests',
                  path: 'tests',
                  percentCovered: 100.0,
                },
              },
            ],
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

const mockTreeDataNested = {
  owner: {
    username: 'codecov-tree',
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
            edges: [
              {
                node: {
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
              },
            ],
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

const mockNoHeadReport = {
  owner: {
    username: 'nicholas-codecov',
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
    initialEntries = '/gh/codecov/cool-repo/tree/main/'
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

describe('CodeTreeTable', () => {
  function setup({
    noFiles = false,
    noHeadReport = false,
    noFlagCoverage = false,
    missingCoverage = false,
    unknownPath = false,
    isNestedTreeData = false,
    hasMultipleRows = false,
  }) {
    const user = userEvent.setup()
    const requestFilters = vi.fn()

    server.use(
      graphql.query('BranchContents', (info) => {
        if (info.variables?.filters) {
          requestFilters(info.variables?.filters)
        }

        if (missingCoverage) {
          return HttpResponse.json({ data: mockMissingCoverage })
        } else if (unknownPath) {
          return HttpResponse.json({ data: mockUnknownPath })
        } else if (noHeadReport) {
          return HttpResponse.json({ data: mockNoHeadReport })
        } else if (noFiles || info?.variables?.filters?.searchValue) {
          return HttpResponse.json({ data: mockNoFiles })
        } else if (noFlagCoverage) {
          return HttpResponse.json({ data: mockNoFiles })
        } else if (hasMultipleRows) {
          return HttpResponse.json({ data: mockDataMultipleRows })
        } else if (isNestedTreeData) {
          return HttpResponse.json({ data: mockTreeDataNested })
        } else {
          return HttpResponse.json({ data: mockTreeData })
        }
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockOverview })
      })
    )

    return { requestFilters, user }
  }

  describe('rendering table', () => {
    describe('displaying the table head', () => {
      it('has a files column', async () => {
        setup({})
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const files = await screen.findByText('Files')
        expect(files).toBeInTheDocument()
      })

      it('has a tracked lines column', async () => {
        setup({})
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const trackedLines = await screen.findByText('Tracked lines')
        expect(trackedLines).toBeInTheDocument()
      })

      it('has a covered column', async () => {
        setup({})
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const covered = await screen.findByText('Covered')
        expect(covered).toBeInTheDocument()
      })

      it('has a partial column', async () => {
        setup({})
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const partial = await screen.findByText('Partial')
        expect(partial).toBeInTheDocument()
      })

      it('has a missed column', async () => {
        setup({})
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const missed = await screen.findByText('Missed')
        expect(missed).toBeInTheDocument()
      })

      it('has a coverage column', async () => {
        setup({})
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const coverage = await screen.findByText('Coverage %')
        expect(coverage).toBeInTheDocument()
      })
    })

    describe('table is displaying file tree', () => {
      describe('default sort is set', () => {
        it('sets default sort to name asc', async () => {
          const { requestFilters } = setup({})

          render(<CodeTreeTable />, { wrapper: wrapper() })

          await waitFor(() =>
            expect(queryClient.isFetching()).toBeGreaterThan(0)
          )
          await waitFor(() => expect(queryClient.isFetching()).toBe(0))

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'ASC', parameter: 'NAME' },
              })
            )
          )
        })
      })

      describe('displaying a directory', () => {
        it('has the correct url', async () => {
          setup({})
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const dir = await screen.findByText('src')
          expect(dir).toBeInTheDocument()

          const table = await screen.findByRole('table')
          const links = await within(table).findAllByRole('link')
          expect(links[0]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/tree/main/src'
          )
        })
      })

      describe('displaying a file', () => {
        it('has the correct url', async () => {
          setup({ isNestedTreeData: true })
          render(<CodeTreeTable />, {
            wrapper: wrapper('/gh/codecov/cool-repo/tree/main/a/b/c/'),
          })

          const file = await screen.findByText('file.js')
          expect(file).toBeInTheDocument()

          const table = await screen.findByRole('table')
          const links = await within(table).findAllByRole('link')
          expect(links[1]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/blob/main/a%2Fb%2Fc%2Ffile.js'
          )
        })
      })
    })

    describe('when branch contents returns unknown path', () => {
      it('renders unknown path message', async () => {
        setup({ missingCoverage: true })
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const message = await screen.findByText('No coverage data available.')
        expect(message).toBeInTheDocument()
      })
    })

    describe('branch contents has missing coverage', () => {
      it('renders the missing coverage message', async () => {
        setup({ unknownPath: true })
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const message = await screen.findByText(
          'Unknown filepath. Please ensure that files/directories exist and are not empty.'
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('when head commit has no reports', () => {
      it('renders no report uploaded message', async () => {
        setup({ noHeadReport: true })
        render(<CodeTreeTable />, { wrapper: wrapper() })

        const message = await screen.findByText(
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
            `/gh/codecov/cool-repo/tree/main/${qs.stringify(
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

  describe('rendering subtotals row', () => {
    it('renders the correct subtotals', async () => {
      setup({ hasMultipleRows: true })
      render(<CodeTreeTable />, { wrapper: wrapper() })
      const subtotal = await screen.findByText('Subtotal')
      expect(subtotal).toBeInTheDocument()
      const bigSum = await screen.findByText('1009')
      expect(bigSum).toBeInTheDocument()
    })

    it('does not render subtotals if there is only one row', async () => {
      setup({})
      render(<CodeTreeTable />, { wrapper: wrapper() })

      const subtotal = screen.queryByText(/Subtotal/)

      expect(subtotal).not.toBeInTheDocument()
    })
  })

  describe('sorting on head columns', () => {
    describe('sorting on head column', () => {
      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})

          render(<CodeTreeTable />, { wrapper: wrapper() })

          const files = await screen.findByText('Files')
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
          const { requestFilters, user } = setup({})
          render(<CodeTreeTable />, { wrapper: wrapper() })

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
      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const trackedLines = await screen.findByText('Tracked lines')
          await user.click(trackedLines)
          await user.click(trackedLines)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'DESC', parameter: 'LINES' },
              })
            )
          )
        })
      })

      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const trackedLines = await screen.findByText('Tracked lines')
          await user.click(trackedLines)
          await user.click(trackedLines)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'ASC', parameter: 'LINES' },
              })
            )
          })
        })
      })
    })

    describe('sorting on the covered column', () => {
      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const covered = await screen.findByText('Covered')
          await user.click(covered)
          await user.click(covered)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'DESC', parameter: 'HITS' },
              })
            )
          )
        })
      })

      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const covered = await screen.findByText('Covered')
          await user.click(covered)
          await user.click(covered)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'ASC', parameter: 'HITS' },
              })
            )
          })
        })
      })
    })

    describe('sorting on the partial column', () => {
      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const partial = await screen.findByText('Partial')
          await user.click(partial)
          await user.click(partial)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'DESC', parameter: 'PARTIALS' },
              })
            )
          )
        })
      })

      describe('sorting in ASC order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const partial = await screen.findByText('Partial')
          await user.click(partial)
          await user.click(partial)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'ASC', parameter: 'PARTIALS' },
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
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const missed = await screen.findByText('Missed')
          await user.click(missed)
          await user.click(missed)

          expect(requestFilters).toHaveBeenCalledWith(
            expect.objectContaining({
              ordering: { direction: 'DESC', parameter: 'MISSES' },
            })
          )
        })
      })

      describe('sorting in asc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup({})
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const missed = await screen.findByText('Missed')
          await user.click(missed)
          await user.click(missed)

          await waitFor(() => {
            expect(requestFilters).toHaveBeenCalledWith(
              expect.objectContaining({
                ordering: { direction: 'ASC', parameter: 'MISSES' },
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
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const coverage = await screen.findByText('Coverage %')
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
          render(<CodeTreeTable />, { wrapper: wrapper() })

          const coverage = await screen.findByText('Coverage %')
          await user.click(coverage)
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
