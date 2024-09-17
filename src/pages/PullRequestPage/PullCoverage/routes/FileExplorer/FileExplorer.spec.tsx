import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import FileExplorer from './FileExplorer'

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
    pull: {
      head: {
        commitid: '123',
        pathContents: {
          __typename: 'PathContents',
          results: [],
        },
      },
    },
    repositoryConfig: {
      indicationRange: {
        upperRange: 80,
        lowerRange: 60,
      },
    },
  },
}

const mockUnknownPath = {
  repository: {
    __typename: 'Repository',
    pull: {
      head: {
        commitid: '123',
        pathContents: {
          __typename: 'UnknownPath',
          message: 'unknown path',
        },
      },
    },
    repositoryConfig: {
      indicationRange: {
        upperRange: 80,
        lowerRange: 60,
      },
    },
  },
}

const mockMissingCoverage = {
  repository: {
    __typename: 'Repository',
    pull: {
      head: {
        commitid: '123',
        pathContents: {
          __typename: 'MissingCoverage',
          message: 'missing coverage',
        },
      },
    },
    repositoryConfig: {
      indicationRange: {
        upperRange: 80,
        lowerRange: 60,
      },
    },
  },
}

const mockListData = {
  repository: {
    __typename: 'Repository',
    pull: {
      head: {
        commitid: '123',
        pathContents: {
          __typename: 'PathContents',
          results: [
            {
              __typename: 'PathContentFile',
              name: 'file.js',
              path: 'a/b/c/file.js',
              hits: 9,
              misses: 1,
              partials: 0,
              lines: 10,
              percentCovered: 90.0,
              isCriticalFile: false,
            },
          ],
        },
      },
    },
    repositoryConfig: {
      indicationRange: {
        upperRange: 80,
        lowerRange: 60,
      },
    },
  },
}

const mockTreeData = {
  repository: {
    __typename: 'Repository',
    pull: {
      head: {
        commitid: '123',
        pathContents: {
          results: [
            {
              __typename: 'PathContentDir',
              name: 'src',
              path: 'src',
              hits: 9,
              misses: 1,
              partials: 0,
              lines: 10,
              percentCovered: 90.0,
            },
            {
              __typename: 'PathContentFile',
              name: 'file.js',
              path: 'a/b/c/file.js',
              hits: 9,
              misses: 1,
              partials: 0,
              lines: 10,
              percentCovered: 90.0,
              isCriticalFile: false,
            },
          ],
          __typename: 'PathContents',
        },
      },
    },
    repositoryConfig: {
      indicationRange: {
        upperRange: 80,
        lowerRange: 60,
      },
    },
  },
}

const mockRepoSettings = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      activated: true,
      defaultBranch: 'main',
      private: false,
      uploadToken: 'token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
    },
  },
}

const mockBackfillData = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: true,
        flagsCount: 4,
      },
    },
  },
}

const wrapper: (
  initalEntries?: string[]
) => React.FC<React.PropsWithChildren> =
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
  function setup(
    noFiles = false,
    missingCoverage = false,
    unknownPath = false
  ) {
    const user = userEvent.setup()
    const requestFilters = jest.fn()

    server.use(
      graphql.query('PullPathContents', (req, res, ctx) => {
        if (req.variables?.filters) {
          requestFilters(req.variables?.filters)
        }

        if (missingCoverage) {
          return res(ctx.status(200), ctx.data({ owner: mockMissingCoverage }))
        }

        if (unknownPath) {
          return res(ctx.status(200), ctx.data({ owner: mockUnknownPath }))
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

    // Mock so the components selector will be populated
    server.use(
      graphql.query('PullComponentsSelector', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                __typename: 'Repository',
                pull: {
                  compareWithBase: {
                    __typename: 'Comparison',
                    componentComparisons: [
                      { name: 'component-1' },
                      { name: 'component-2' },
                      { name: 'component-3' },
                    ],
                  },
                },
              },
            },
          })
        )
      )
    )

    // Mock so the flags selector will be populated
    server.use(
      graphql.query('PullFlagsSelect', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                __typename: 'Repository',
                pull: {
                  compareWithBase: {
                    __typename: 'Comparison',
                    flagComparisons: [
                      { name: 'flag-1' },
                      { name: 'flag-2' },
                      { name: 'flag-3' },
                    ],
                  },
                },
              },
            },
          })
        )
      ),
      graphql.query('BackfillFlagMemberships', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockBackfillData))
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({ owner: { plan: { tierName: TierNames.PRO } } })
        )
      }),
      graphql.query('GetRepoSettingsTeam', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoSettings))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
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
                isCurrentUserActivated: true,
              },
            },
          })
        )
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
      it('renders components selector', async () => {
        setup()
        render(<FileExplorer />, { wrapper: wrapper() })

        const selector = await screen.findByText('All components')
        expect(selector).toBeInTheDocument()
      })

      it('renders flags selector', async () => {
        setup()
        render(<FileExplorer />, { wrapper: wrapper() })

        const selector = await screen.findByText('All flags')
        expect(selector).toBeInTheDocument()
      })
    })

    describe('table is displaying file tree', () => {
      describe('default sort is set', () => {
        it('sets default sort to name asc', async () => {
          const { requestFilters } = setup()
          render(<FileExplorer />, { wrapper: wrapper() })

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              displayType: 'TREE',
              ordering: { direction: 'ASC', parameter: 'NAME' },
              searchValue: '',
            })
          )
        })
      })

      describe('displaying a directory', () => {
        it('has the correct url', async () => {
          setup()
          render(<FileExplorer />, { wrapper: wrapper() })

          const dir = await screen.findByText('src')
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

          const file = await screen.findByText('file.js')
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

    describe('pull contents returns unknown path', () => {
      it('renders unknown path message', async () => {
        setup(false, true, false)
        render(<FileExplorer />, { wrapper: wrapper() })

        const message = await screen.findByText('No coverage data available.')
        expect(message).toBeInTheDocument()
      })
    })

    describe('pull contents has missing coverage', () => {
      it('renders the missing coverage message', async () => {
        setup(false, false, true)
        render(<FileExplorer />, { wrapper: wrapper() })

        const message = await screen.findByText(
          'Unknown filepath. Please ensure that files/directories exist and are not empty.'
        )
        expect(message).toBeInTheDocument()
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
            expect(requestFilters).toHaveBeenCalledWith({
              displayType: 'LIST',
              ordering: { direction: 'DESC', parameter: 'MISSES' },
              searchValue: '',
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

          const file = await screen.findByText('a/b/c/file.js')
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

          const files = await screen.findByText('Files')
          expect(files).toBeInTheDocument()

          await user.click(files)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              displayType: 'TREE',
              ordering: { direction: 'ASC', parameter: 'NAME' },
              searchValue: '',
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          const files = await screen.findByText('Files')
          await user.click(files)
          await user.click(files)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              displayType: 'TREE',
              ordering: { direction: 'DESC', parameter: 'NAME' },
              searchValue: '',
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

          const trackedLines = await screen.findByText('Tracked lines')
          await user.click(trackedLines)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'LINES' },
              displayType: 'TREE',
              searchValue: '',
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          const trackedLines = await screen.findByText('Tracked lines')
          await user.click(trackedLines)
          await user.click(trackedLines)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'LINES' },
              displayType: 'TREE',
              searchValue: '',
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

          const covered = await screen.findByText('Covered')
          await user.click(covered)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'HITS' },
              displayType: 'TREE',
              searchValue: '',
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          const covered = await screen.findByText('Covered')
          await user.click(covered)
          await user.click(covered)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'HITS' },
              displayType: 'TREE',
              searchValue: '',
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

          const partial = await screen.findByText('Partial')
          await user.click(partial)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'PARTIALS' },
              displayType: 'TREE',
              searchValue: '',
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          const partial = await screen.findByText('Partial')
          await user.click(partial)
          await user.click(partial)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'PARTIALS' },
              displayType: 'TREE',
              searchValue: '',
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

          const missed = await screen.findByText('Missed')
          await user.click(missed)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'ASC', parameter: 'MISSES' },
              displayType: 'TREE',
              searchValue: '',
            })
          )
        })
      })

      describe('sorting in desc order', () => {
        it('sets the correct api variables', async () => {
          const { requestFilters, user } = setup()

          render(<FileExplorer />, { wrapper: wrapper() })

          const missed = await screen.findByText('Missed')
          await user.click(missed)
          await user.click(missed)

          await waitFor(() =>
            expect(requestFilters).toHaveBeenCalledWith({
              ordering: { direction: 'DESC', parameter: 'MISSES' },
              displayType: 'TREE',
              searchValue: '',
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
          await screen.findByRole('textbox', {
            name: 'Search for files',
          })
        ).toBeTruthy()
        const search = screen.getByRole('textbox', {
          name: 'Search for files',
        })
        await user.type(search, 'cool-file.rs')

        await waitFor(() =>
          expect(requestFilters).toHaveBeenCalledWith({
            displayType: 'TREE',
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

        const dir = await screen.findByText('src')
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

  describe('filtering by component', () => {
    describe('api variables are being set', () => {
      it('sets the correct api variables', async () => {
        const { requestFilters, user } = setup()

        render(<FileExplorer />, { wrapper: wrapper() })

        const components = await screen.findByText('All components')
        await user.click(components)

        const component1 = await screen.findByText('component-1')
        await user.click(component1)

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        await waitFor(() =>
          expect(requestFilters).toHaveBeenCalledWith({
            components: ['component-1'],
            displayType: 'TREE',
            ordering: { direction: 'ASC', parameter: 'NAME' },
            searchValue: '',
          })
        )
      })
    })
  })

  describe('filtering by flag', () => {
    describe('api variables are being set', () => {
      it('sets the correct api variables', async () => {
        const { requestFilters, user } = setup()

        render(<FileExplorer />, { wrapper: wrapper() })

        const components = await screen.findByText('All flags')
        await user.click(components)

        const component1 = await screen.findByText('flag-1')
        await user.click(component1)

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        await waitFor(() =>
          expect(requestFilters).toHaveBeenCalledWith({
            flags: ['flag-1'],
            displayType: 'TREE',
            ordering: { direction: 'ASC', parameter: 'NAME' },
            searchValue: '',
          })
        )
      })
    })
  })
})
