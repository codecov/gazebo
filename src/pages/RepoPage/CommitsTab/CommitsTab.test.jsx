import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import CommitsTab from './CommitsTab'

import { RepoBreadcrumbProvider } from '../context'

const mocks = vi.hoisted(() => ({
  useIntersection: vi.fn(),
}))

vi.mock('react-use', async () => {
  const actual = await vi.importActual('react-use')
  return {
    ...actual,
    useIntersection: mocks.useIntersection,
  }
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const server = setupServer()
let testLocation

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/commits']}>
      <Route path="/:provider/:owner/:repo/commits">
        <Suspense fallback={<p>Loading</p>}>
          <RepoBreadcrumbProvider>{children}</RepoBreadcrumbProvider>
        </Suspense>
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

const mockBranches = (hasNextPage = false) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      branches: {
        edges: [
          {
            node: { name: 'main', head: { commitid: '1' } },
          },
        ],
        pageInfo: {
          hasNextPage,
          endCursor: hasNextPage ? 'some cursor' : null,
        },
      },
    },
  },
})

const mockCommits = {
  owner: {
    repository: {
      __typename: 'Repository',
      commits: {
        edges: [
          {
            node: {
              ciPassed: false,
              message: 'commit message 3',
              commitid: '7822fd88f36efcd9af276792813a83da17bd3c67',
              createdAt: '2023-10-13T00:00.000000',
              author: {
                username: 'codecov-user',
                avatarUrl: 'http://127.0.0.1/cool-user-avatar',
              },
              bundleStatus: 'COMPLETED',
              coverageStatus: 'COMPLETED',
              compareWithParent: {
                __typename: 'Comparison',
                patchTotals: {
                  percentCovered: 100,
                },
              },
              bundleAnalysis: {
                bundleAnalysisCompareWithParent: {
                  __typename: 'BundleAnalysisComparison',
                  bundleChange: {
                    size: {
                      uncompress: 1001,
                    },
                  },
                },
              },
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'some cursor',
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
      testAnalyticsEnabled: false,
    },
  },
}

const mockBranch = (branchName) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        name: branchName,
        head: {
          commitid: branchName === 'imogen' ? 'commit-123' : 'commit-321',
        },
      },
    },
  },
})

const mockRepoSettings = (isPrivate = false) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      activated: true,
      defaultBranch: 'master',
      private: isPrivate,
      uploadToken: 'token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
    },
  },
})

const mockBranchHasCommits = {
  owner: {
    repository: {
      __typename: 'Repository',
      commits: {
        edges: [
          {
            node: {
              commitid: 'commit-123',
            },
          },
        ],
      },
    },
  },
}

const mockBranchHasNoCommits = {
  owner: {
    repository: {
      __typename: 'Repository',
      commits: {
        edges: [],
      },
    },
  },
}

describe('CommitsTab', () => {
  function setup({
    hasNextPage,
    hasBranches,
    returnBranch = '',
    branchHasCommits = true,
    isPrivate = false,
  }) {
    const user = userEvent.setup()
    const fetchNextPage = vi.fn()
    const branchSearch = vi.fn()
    const commitSearch = vi.fn()
    const branchName = vi.fn()

    server.use(
      graphql.query('GetBranches', (info) => {
        if (info?.variables?.after) {
          fetchNextPage(info?.variables?.after)
        }

        if (info?.variables?.filters?.searchValue) {
          branchSearch(info?.variables?.filters?.searchValue)
        }

        if (hasBranches) {
          return HttpResponse.json({
            data: { owner: { repository: { branches: null } } },
          })
        }

        return HttpResponse.json({ data: mockBranches(hasNextPage) })
      }),
      graphql.query('GetCommits', (info) => {
        if (info?.variables?.filters?.branchName) {
          branchName(info?.variables?.filters?.branchName)
        }

        if (info?.variables?.filters?.search) {
          commitSearch(info?.variables?.filters?.search)
        }

        return HttpResponse.json({ data: mockCommits })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockOverview })
      }),
      graphql.query('GetBranch', (info) => {
        if (returnBranch) {
          return HttpResponse.json({ data: mockBranch(returnBranch) })
        }

        return HttpResponse.json({ data: { owner: null } })
      }),
      graphql.query('GetRepo', (info) => {
        return HttpResponse.json({ data: { owner: null } })
      }),
      graphql.query('GetRepoSettingsTeam', (info) => {
        return HttpResponse.json({ data: mockRepoSettings(isPrivate) })
      }),
      graphql.query('GetBranchCommits', (info) => {
        if (branchHasCommits) {
          return HttpResponse.json({ data: mockBranchHasCommits })
        }

        return HttpResponse.json({ data: mockBranchHasNoCommits })
      })
    )

    return { fetchNextPage, branchSearch, user, branchName, commitSearch }
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('when rendered', () => {
    describe('rendering branch selector', () => {
      describe('when branch has commits', () => {
        it('uses default branch', async () => {
          setup({ hasNextPage: true, returnBranch: 'main' })
          render(<CommitsTab />, { wrapper })

          const selector = await screen.findByRole('button', {
            name: 'Select branch',
          })
          expect(selector).toBeInTheDocument()

          const selectedBranch = within(selector).getByText(/main/)
          expect(selectedBranch).toBeInTheDocument()
        })
      })

      describe('when branch has no commits', () => {
        it('uses returned branch', async () => {
          setup({ branchHasCommits: false, returnBranch: 'main' })
          render(<CommitsTab />, { wrapper })

          const selector = await screen.findByRole('button', {
            name: 'Select branch',
          })
          expect(selector).toBeInTheDocument()

          const selectedBranch =
            await within(selector).findByText(/All branches/)
          expect(selectedBranch).toBeInTheDocument()
        })
      })
    })

    it('renders ci status multiselect', async () => {
      setup({ hasNextPage: true })
      render(<CommitsTab />, { wrapper })

      const multiSelect = await screen.findByRole('button', {
        name: 'Filter by coverage upload status',
      })
      expect(multiSelect).toBeInTheDocument()
    })
  })

  describe('rendering CommitsTable', () => {
    it('renders with table name heading', async () => {
      setup({ hasNextPage: true })
      render(<CommitsTab />, { wrapper })

      const head = await screen.findByText(/Name/)
      expect(head).toBeInTheDocument()
    })

    describe('when select onLoadMore is triggered', () => {
      beforeEach(() => {
        mocks.useIntersection.mockReturnValue({
          isIntersecting: true,
        })
      })

      afterEach(() => {
        vi.clearAllMocks()
      })

      describe('when there is not a next page', () => {
        it('does not call fetchNextPage', async () => {
          const { user, fetchNextPage } = setup({ hasNextPage: false })
          render(<CommitsTab />, { wrapper })

          const select = await screen.findByRole('button', {
            name: 'Select branch',
          })
          await user.click(select)

          await waitFor(() => expect(fetchNextPage).not.toHaveBeenCalled())
        })
      })

      describe('when there is a next page', () => {
        it('calls fetchNextPage', async () => {
          const { fetchNextPage, user } = setup({ hasNextPage: true })
          render(<CommitsTab />, { wrapper })

          const select = await screen.findByText('Select branch')
          await user.click(select)

          await waitFor(() =>
            expect(fetchNextPage).toHaveBeenCalledWith('some cursor')
          )
        })
      })
    })

    describe('user selects from the branch selector', () => {
      describe('user selects All branches', () => {
        it('updates the button with the selected branch', async () => {
          const { user } = setup({ hasNextPage: false, returnBranch: 'main' })
          render(<CommitsTab />, { wrapper })

          const select = await screen.findByRole('button', {
            name: 'Select branch',
          })
          await user.click(select)

          const branch = await screen.findByText('All branches')
          await user.click(branch)

          const allCommitsBtn = await screen.findByRole('button', {
            name: 'Select branch',
          })
          expect(allCommitsBtn).toBeInTheDocument()

          const selectedBranch = within(allCommitsBtn).getByText(/All branches/)
          expect(selectedBranch).toBeInTheDocument()

          await waitFor(() => {
            expect(testLocation?.pathname).toStrictEqual(
              '/gh/codecov/gazebo/commits/All branches'
            )
          })

          await user.click(select)
          const mainBranch = await screen.findByText('main')
          await user.click(mainBranch)

          const newSelectedBranch = within(allCommitsBtn).getByText(/main/)
          expect(newSelectedBranch).toBeInTheDocument()

          await waitFor(() => {
            expect(testLocation?.pathname).toStrictEqual(
              '/gh/codecov/gazebo/commits/main'
            )
          })
        })
      })

      describe('user selects a branch', () => {
        it('updates the button with the selected branch', async () => {
          const { user } = setup({ hasNextPage: false, returnBranch: 'main' })
          render(<CommitsTab />, { wrapper })

          const select = await screen.findByRole('button', {
            name: 'Select branch',
          })
          await user.click(select)

          const branch = await screen.findByRole('option', { name: 'main' })
          await user.click(branch)

          const allCommitsBtn = await screen.findByRole('button', {
            name: 'Select branch',
          })
          expect(allCommitsBtn).toBeInTheDocument()

          const selectedBranch = within(allCommitsBtn).getByText(/main/)
          expect(selectedBranch).toBeInTheDocument()
        })
      })
    })

    describe('user selects from the CI states multiselect', () => {
      it('selects the option', async () => {
        const { user } = setup({})
        render(<CommitsTab />, { wrapper })

        const select = await screen.findByRole('button', {
          name: 'Filter by coverage upload status',
        })
        await user.click(select)

        const completedOption = await screen.findByRole('option', {
          name: /Completed/,
        })
        await user.click(completedOption)

        await waitFor(() =>
          expect(completedOption).toHaveClass('border-l-ds-secondary-text')
        )
      })
    })

    describe('user searches for branch', () => {
      it('fetches request with search term', async () => {
        const { branchSearch, user } = setup({ hasNextPage: false })
        render(<CommitsTab />, { wrapper })

        const select = await screen.findByText('Select branch')
        await user.click(select)

        const search = await screen.findByPlaceholderText('Search for branches')
        await user.type(search, 'searching for a branch')

        await waitFor(() => expect(branchSearch).toHaveBeenCalled())
        await waitFor(() =>
          expect(branchSearch).toHaveBeenCalledWith('searching for a branch')
        )
      })

      it('hides All branches from list', async () => {
        const { branchSearch, user } = setup({ hasNextPage: false })
        render(<CommitsTab />, { wrapper })

        const select = await screen.findByRole('button', {
          name: 'Select branch',
        })
        await user.click(select)

        const search = await screen.findByPlaceholderText('Search for branches')
        await user.type(search, 'searching for a branch')

        await waitFor(() => expect(branchSearch).toHaveBeenCalled())

        const allCommits = screen.queryByText('All branches')
        expect(allCommits).not.toBeInTheDocument()
      })
    })

    describe('user searches for commit', () => {
      it('fetches commits request with search term', async () => {
        const { commitSearch, user } = setup({ hasNextPage: false })
        render(<CommitsTab />, { wrapper })

        const search = await screen.findByPlaceholderText('Search commits')
        await user.type(search, 'searching for a commit')

        await waitFor(() => expect(commitSearch).toHaveBeenCalled())
        await waitFor(() =>
          expect(commitSearch).toHaveBeenCalledWith('searching for a commit')
        )
      })
    })
  })

  describe('rendering CommitsTableTeam', () => {
    describe('user selects from the branch selector', () => {
      describe('user selects All branches', () => {
        it('updates the button with the selected branch', async () => {
          const { user } = setup({
            hasNextPage: false,
            returnBranch: 'main',
            tierValue: TierNames.TEAM,
            isPrivate: true,
          })
          render(<CommitsTab />, { wrapper })

          const select = await screen.findByRole('button', {
            name: 'Select branch',
          })
          await user.click(select)

          const branch = await screen.findByText('All branches')
          await user.click(branch)

          const allCommitsBtn = await screen.findByRole('button', {
            name: 'Select branch',
          })
          expect(allCommitsBtn).toBeInTheDocument()

          const selectedBranch = within(allCommitsBtn).getByText(/All branches/)
          expect(selectedBranch).toBeInTheDocument()
        })
      })

      describe('user selects a branch', () => {
        it('updates the button with the selected branch', async () => {
          const { user } = setup({
            hasNextPage: false,
            returnBranch: 'main',
            tierValue: TierNames.TEAM,
            isPrivate: true,
          })
          render(<CommitsTab />, { wrapper })

          const select = await screen.findByRole('button', {
            name: 'Select branch',
          })
          await user.click(select)

          const branch = await screen.findByRole('option', { name: 'main' })
          await user.click(branch)

          const allCommitsBtn = await screen.findByRole('button', {
            name: 'Select branch',
          })
          expect(allCommitsBtn).toBeInTheDocument()

          const selectedBranch = within(allCommitsBtn).getByText(/main/)
          expect(selectedBranch).toBeInTheDocument()
        })
      })
    })

    describe('user selects from the CI states multiselect', () => {
      it('selects the option', async () => {
        const { user } = setup({ tierValue: TierNames.TEAM, isPrivate: true })
        render(<CommitsTab />, { wrapper })

        const select = await screen.findByRole('button', {
          name: 'Filter by coverage upload status',
        })
        await user.click(select)

        const completedOption = await screen.findByRole('option', {
          name: /Completed/,
        })
        await user.click(completedOption)

        await waitFor(() =>
          expect(completedOption).toHaveClass('border-l-ds-secondary-text')
        )
      })
    })

    describe('user searches for branch', () => {
      it('fetches request with search term', async () => {
        const { branchSearch, user } = setup({
          hasNextPage: false,
          tierValue: TierNames.TEAM,
          isPrivate: true,
        })
        render(<CommitsTab />, { wrapper })

        const select = await screen.findByText('Select branch')
        await user.click(select)

        const search = await screen.findByPlaceholderText('Search for branches')
        await user.type(search, 'searching for a branch')

        await waitFor(() => expect(branchSearch).toHaveBeenCalled())
        await waitFor(() =>
          expect(branchSearch).toHaveBeenCalledWith('searching for a branch')
        )
      })

      it('hides All branches from list', async () => {
        const { branchSearch, user } = setup({
          hasNextPage: false,
          tierValue: TierNames.TEAM,
          isPrivate: true,
        })
        render(<CommitsTab />, { wrapper })

        const select = await screen.findByRole('button', {
          name: 'Select branch',
        })
        await user.click(select)

        const search = await screen.findByPlaceholderText('Search for branches')
        await user.type(search, 'searching for a branch')

        await waitFor(() => expect(branchSearch).toHaveBeenCalled())

        const allCommits = screen.queryByText('All branches')
        expect(allCommits).not.toBeInTheDocument()
      })
    })

    describe('user searches for commit', () => {
      it('fetches commits request with search term', async () => {
        const { commitSearch, user } = setup({
          hasNextPage: false,
          tierValue: TierNames.TEAM,
          isPrivate: true,
        })
        render(<CommitsTab />, { wrapper })

        const search = await screen.findByPlaceholderText('Search commits')
        await user.type(search, 'searching for a commit')

        await waitFor(() => expect(commitSearch).toHaveBeenCalled())
        await waitFor(() =>
          expect(commitSearch).toHaveBeenCalledWith('searching for a commit')
        )
      })
    })
  })
})
