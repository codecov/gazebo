import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitDetailFileExplorer from './CommitDetailFileExplorer'
import CommitDetailFileExplorerTable from './CommitDetailFileExplorerTable'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

const mockNoFiles = {
  repository: {
    __typename: 'Repository',
    commit: {
      pathContents: {
        results: [],
        __typename: 'PathContents',
      },
    },
  },
}

const mockUnknownPath = {
  repository: {
    __typename: 'Repository',
    commit: {
      pathContents: {
        __typename: 'UnknownPath',
        message: 'failed',
      },
    },
  },
}

const mockMissingCoverage = {
  repository: {
    __typename: 'Repository',
    commit: {
      pathContents: {
        results: [],
        __typename: 'MissingCoverage',
      },
    },
  },
}

const mockListData = {
  repository: {
    __typename: 'Repository',
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
            isCriticalFile: false,
          },
        ],
        __typename: 'PathContents',
      },
    },
  },
}

const mockTreeData = {
  owner: {
    repository: {
      __typename: 'Repository',
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
              type: 'dir',
              percentCovered: 100.0,
            },
            {
              __typename: 'PathContentFile',
              hits: 9,
              type: 'file',
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

const mockFlagBackfillData = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      coverageAnalytics: {
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: true,
        flagsCount: 4,
      },
    },
  },
}

const mockCommitComponentData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        coverageAnalytics: {
          components: [{ name: 'component-1' }, { name: 'component-2' }],
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
      private: true,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: ['typescript'],
      testAnalyticsEnabled: true,
    },
  },
}

const mockOwnerTier = {
  owner: {
    plan: {
      tierName: 'pro',
    },
  },
}

const mockFlagsResponse = {
  owner: {
    repository: {
      coverageAnalytics: {
        flags: {
          edges: [
            {
              node: {
                name: 'flag-1',
              },
            },
          ],
          pageInfo: {
            hasNextPage: true,
            endCursor: '1-flag-1',
          },
        },
      },
    },
  },
}

type WrapperClosure = (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren>

const wrapper: WrapperClosure =
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

console.error = () => {}

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

describe('CommitDetailFileExplorerTable', () => {
  function setup({
    noFiles = false,
    missingCoverage = false,
    unknownPath = false,
  } = {}) {
    const user = userEvent.setup()
    const requestFilters = vi.fn()

    server.use(
      graphql.query('CommitPathContents', (info) => {
        requestFilters(info.variables.filters)

        if (missingCoverage) {
          return HttpResponse.json({ data: { owner: mockMissingCoverage } })
        }

        if (unknownPath) {
          return HttpResponse.json({ data: { owner: mockUnknownPath } })
        }

        if (noFiles || info.variables?.filters?.searchValue) {
          return HttpResponse.json({ data: { owner: mockNoFiles } })
        }

        if (
          info.variables?.filters?.displayType &&
          info.variables?.filters?.displayType === 'LIST'
        ) {
          return HttpResponse.json({ data: { owner: mockListData } })
        }

        return HttpResponse.json({ data: mockTreeData })
      }),
      graphql.query('BackfillFlagMemberships', (info) => {
        return HttpResponse.json({ data: mockFlagBackfillData })
      }),
      graphql.query('CommitComponents', (info) => {
        return HttpResponse.json({ data: mockCommitComponentData })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockOverview })
      }),
      graphql.query('OwnerTier', (info) => {
        return HttpResponse.json({ data: mockOwnerTier })
      }),
      graphql.query('FlagsSelect', (info) => {
        return HttpResponse.json({ data: mockFlagsResponse })
      })
    )

    return { requestFilters, user }
  }

  describe('rendering table', () => {
    describe('table headers', () => {
      beforeEach(() => setup())

      it('has a files column', async () => {
        render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

        const files = await screen.findByText('Files')
        expect(files).toBeInTheDocument()
      })

      it('has a tracked lines column', async () => {
        render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

        const trackedLines = await screen.findByText('Tracked lines')
        expect(trackedLines).toBeInTheDocument()
      })

      it('has a covered column', async () => {
        render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

        const covered = await screen.findByText('Covered')
        expect(covered).toBeInTheDocument()
      })

      it('has a partial column', async () => {
        render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

        const partial = await screen.findByText('Partial')
        expect(partial).toBeInTheDocument()
      })

      it('has a missed column', async () => {
        render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

        const missed = await screen.findByText('Missed')
        expect(missed).toBeInTheDocument()
      })

      it('has a coverage column', async () => {
        render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

        const coverage = await screen.findByText('Coverage %')
        expect(coverage).toBeInTheDocument()
      })
    })

    describe('table is displaying file tree', () => {
      describe('default sort is set', () => {
        it('sets default sort to name asc', async () => {
          const { requestFilters } = setup()
          render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              displayType: 'TREE',
              searchValue: '',
              ordering: { direction: 'ASC', parameter: 'NAME' },
            })
          )
        })
      })

      describe('displaying a directory', () => {
        it('has the correct url', async () => {
          setup()
          render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

          const dir = await screen.findByText('src')
          expect(dir).toBeInTheDocument()

          const table = await screen.findByRole('table')
          const links = await within(table).findAllByRole('link')

          expect(links[1]).toHaveAttribute(
            'href',
            '/gh/codecov/cool-repo/commit/sha256/tree/a/b/c/src'
          )
        })
      })

      describe('displaying a file', () => {
        it('has the correct url', async () => {
          setup()
          render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

          const file = await screen.findByText('file.js')
          expect(file).toBeInTheDocument()

          const table = await screen.findByRole('table')
          const links = await within(table).findAllByRole('link')
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
          render(<CommitDetailFileExplorerTable />, {
            wrapper: wrapper([
              '/gh/codecov/cool-repo/commit/sha256/tree/a/b/c?displayType=list',
            ]),
          })

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              displayType: 'LIST',
              searchValue: '',
              ordering: { direction: 'DESC', parameter: 'MISSES' },
            })
          )
        })
      })

      describe('displaying a file', () => {
        it('has the correct url', async () => {
          setup()
          render(<CommitDetailFileExplorerTable />, {
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
      describe('there is no results found', () => {
        beforeEach(() => setup({ noFiles: true }))

        it('displays error fetching data message', async () => {
          render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

          const message = await screen.findByText(
            'There was a problem getting repo contents from your provider'
          )
          expect(message).toBeInTheDocument()
        })
      })
    })

    describe('commit contents returns missing coverage', () => {
      it('renders missing coverage message', async () => {
        setup({ missingCoverage: true })
        render(<CommitDetailFileExplorerTable />, {
          wrapper: wrapper([
            '/gh/codecov/cool-repo/commit/sha256/tree/a/b/c?displayType=list',
          ]),
        })

        const message = await screen.findByText('No coverage data available.')
        expect(message).toBeInTheDocument()
      })
    })

    describe('commit contents has unknown path', () => {
      it('renders the unknown path message', async () => {
        setup({ unknownPath: true })
        render(<CommitDetailFileExplorerTable />, {
          wrapper: wrapper([
            '/gh/codecov/cool-repo/commit/sha256/tree/a/b/c?displayType=list',
          ]),
        })

        const message = await screen.findByText(
          'Unknown filepath. Please ensure that files/directories exist and are not empty.'
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('sorting on head columns', () => {
      describe('sorting on name column', () => {
        describe('sorting in asc order', () => {
          it('sets the correct api variables', async () => {
            const { user, requestFilters } = setup()
            render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

            const files = await screen.findByText('Files')
            await user.click(files)

            await waitFor(() => {
              expect(requestFilters).toHaveBeenCalledWith({
                displayType: 'TREE',
                searchValue: '',
                ordering: { direction: 'ASC', parameter: 'NAME' },
              })
            })
          })
        })

        describe('sorting in desc order', () => {
          it('sets the correct api variables', async () => {
            const { user, requestFilters } = setup()
            render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

            const files = await screen.findByText('Files')
            await user.click(files)
            await user.click(files)

            await waitFor(() => {
              expect(requestFilters).toHaveBeenCalledWith({
                displayType: 'TREE',
                searchValue: '',
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
            render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

            const trackedLines = await screen.findByText('Tracked lines')
            await user.click(trackedLines)

            await waitFor(() => {
              expect(requestFilters).toHaveBeenCalledWith({
                displayType: 'TREE',
                searchValue: '',
                ordering: { direction: 'ASC', parameter: 'LINES' },
              })
            })
          })
        })

        describe('sorting in desc order', () => {
          it('sets the correct api variables', async () => {
            const { user, requestFilters } = setup()
            render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

            const trackedLines = await screen.findByText('Tracked lines')
            await user.click(trackedLines)
            await user.click(trackedLines)

            await waitFor(() => {
              expect(requestFilters).toHaveBeenCalledWith({
                displayType: 'TREE',
                searchValue: '',
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
            render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

            const covered = await screen.findByText('Covered')
            await user.click(covered)

            await waitFor(() => {
              expect(requestFilters).toHaveBeenCalledWith({
                displayType: 'TREE',
                searchValue: '',
                ordering: { direction: 'ASC', parameter: 'HITS' },
              })
            })
          })
        })

        describe('sorting in desc order', () => {
          it('sets the correct api variables', async () => {
            const { user, requestFilters } = setup()
            render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

            const covered = await screen.findByText('Covered')
            await user.click(covered)
            await user.click(covered)

            await waitFor(() => {
              expect(requestFilters).toHaveBeenCalledWith({
                displayType: 'TREE',
                searchValue: '',
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
            render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

            const partial = await screen.findByText('Partial')
            await user.click(partial)

            await waitFor(() => {
              expect(requestFilters).toHaveBeenCalledWith({
                displayType: 'TREE',
                searchValue: '',
                ordering: { direction: 'ASC', parameter: 'PARTIALS' },
              })
            })
          })
        })

        describe('sorting in desc order', () => {
          it('sets the correct api variables', async () => {
            const { user, requestFilters } = setup()
            render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

            const partial = await screen.findByText('Partial')
            await user.click(partial)
            await user.click(partial)

            await waitFor(() => {
              expect(requestFilters).toHaveBeenCalledWith({
                displayType: 'TREE',
                searchValue: '',
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
            render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

            const missed = await screen.findByText('Missed')
            await user.click(missed)

            await waitFor(() => {
              expect(requestFilters).toHaveBeenCalledWith({
                displayType: 'TREE',
                searchValue: '',
                ordering: { direction: 'ASC', parameter: 'MISSES' },
              })
            })
          })
        })

        describe('sorting in desc order', () => {
          it('sets the correct api variables', async () => {
            const { user, requestFilters } = setup()
            render(<CommitDetailFileExplorerTable />, { wrapper: wrapper() })

            const missed = await screen.findByText('Missed')
            await user.click(missed)
            await user.click(missed)

            await waitFor(() => {
              expect(requestFilters).toHaveBeenCalledWith({
                displayType: 'TREE',
                searchValue: '',
                ordering: { direction: 'DESC', parameter: 'MISSES' },
              })
            })
          })
        })
      })
    })

    describe('testing search functionality', () => {
      it('sets the correct search param', async () => {
        const { user, requestFilters } = setup()
        // search box exists in parent component
        render(<CommitDetailFileExplorer />, { wrapper: wrapper() })

        const search = await screen.findByRole('textbox', {
          name: 'Search for files',
        })

        await user.type(search, 'file.js')
        await waitFor(() =>
          expect(requestFilters).toHaveBeenCalledWith({
            displayType: 'TREE',
            searchValue: 'file.js',
            ordering: { direction: 'ASC', parameter: 'NAME' },
          })
        )
      })
    })
  })
})
