import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import useIntersection from 'react-use/lib/useIntersection'

import { TierNames } from 'services/tier'

import CommitsTab from './CommitsTab'

import { repoPageRender, screen, waitFor } from '../repo-jest-setup'

jest.mock('react-use/lib/useIntersection')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const server = setupServer()

const Wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={<p>loading</p>}>{children}</Suspense>
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
            node: {
              name: 'main',
              head: {
                commitid: '1',
              },
            },
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
              totals: {
                coverage: 100,
              },
              parent: {
                totals: {
                  coverage: 0,
                },
              },
              compareWithParent: {
                __typename: 'Comparison',
                patchTotals: {
                  percentCovered: 100,
                },
              },
              bundleAnalysisReport: {
                __typename: 'BundleAnalysisReport',
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
    repository: {
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

const mockCommitTeamResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      commits: {
        edges: [
          {
            node: {
              ciPassed: true,
              message: 'commit message 1',
              commitid: 'fdb5b182241cfdc8d8a8dd1c6f98d1259f522b9c',
              createdAt: '2023-10-11T00:00.000000',
              author: {
                username: 'codecov-user',
                avatarUrl: 'http://127.0.0.1/avatar-url',
              },
              compareWithParent: {
                __typename: 'Comparison',
                patchTotals: {
                  percentCovered: 80,
                },
              },
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
}

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
    tierValue = TierNames.PRO,
  }) {
    const user = userEvent.setup()
    const fetchNextPage = jest.fn()
    const branchSearch = jest.fn()
    const commitSearch = jest.fn()
    const branchName = jest.fn()

    server.use(
      graphql.query('GetBranches', (req, res, ctx) => {
        if (!!req?.variables?.after) {
          fetchNextPage(req?.variables?.after)
        }

        if (!!req?.variables?.filters?.searchValue) {
          branchSearch(req?.variables?.filters?.searchValue)
        }

        if (hasBranches) {
          return res(
            ctx.status(200),
            ctx.data({ owner: { repository: { branches: null } } })
          )
        }

        return res(ctx.status(200), ctx.data(mockBranches(hasNextPage)))
      }),
      graphql.query('GetCommits', (req, res, ctx) => {
        if (!!req?.variables?.filters?.branchName) {
          branchName(req?.variables?.filters?.branchName)
        }

        if (!!req?.variables?.filters?.search) {
          commitSearch(req?.variables?.filters?.search)
        }

        return res(ctx.status(200), ctx.data(mockCommits))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockOverview))
      ),
      graphql.query('GetBranch', (req, res, ctx) => {
        if (returnBranch) {
          return res(ctx.status(200), ctx.data(mockBranch(returnBranch)))
        }

        return res(ctx.status(200), ctx.data({ owner: null }))
      }),
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      graphql.query('GetRepoSettingsTeam', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoSettings(isPrivate)))
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        if (tierValue === TierNames.TEAM) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: { plan: { tierName: TierNames.TEAM } },
            })
          )
        }

        return res(
          ctx.status(200),
          ctx.data({
            owner: { plan: { tierName: 'pro' } },
          })
        )
      }),
      graphql.query('GetCommitsTeam', (req, res, ctx) => {
        if (!!req?.variables?.filters?.branchName) {
          branchName(req?.variables?.filters?.branchName)
        }

        if (!!req?.variables?.filters?.search) {
          commitSearch(req?.variables?.filters?.search)
        }
        return res(ctx.status(200), ctx.data(mockCommitTeamResponse))
      }),
      graphql.query('GetBranchCommits', (req, res, ctx) => {
        if (branchHasCommits) {
          return res(ctx.status(200), ctx.data(mockBranchHasCommits))
        } else {
          return res(ctx.status(200), ctx.data(mockBranchHasNoCommits))
        }
      })
    )

    return { fetchNextPage, branchSearch, user, branchName, commitSearch }
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when rendered', () => {
    describe('rendering branch selector', () => {
      describe('when branch has commits', () => {
        it('uses default branch', async () => {
          setup({ hasNextPage: true, returnBranch: 'main' })
          repoPageRender({
            renderCommits: () => (
              <Wrapper>
                <CommitsTab />
              </Wrapper>
            ),
            initialEntries: ['/gh/codecov/gazebo/commits'],
          })

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
          repoPageRender({
            renderCommits: () => (
              <Wrapper>
                <CommitsTab />
              </Wrapper>
            ),
            initialEntries: ['/gh/codecov/gazebo/commits'],
          })

          const selector = await screen.findByRole('button', {
            name: 'Select branch',
          })
          expect(selector).toBeInTheDocument()

          const selectedBranch = await within(selector).findByText(
            /All branches/
          )
          expect(selectedBranch).toBeInTheDocument()
        })
      })
    })

    it('renders ci status mutliselect', async () => {
      setup({ hasNextPage: true })
      repoPageRender({
        renderCommits: () => (
          <Wrapper>
            <CommitsTab />
          </Wrapper>
        ),
        initialEntries: ['/gh/codecov/gazebo/commits'],
      })

      const multiSelect = await screen.findByRole('button', {
        name: 'Filter by CI states',
      })
      expect(multiSelect).toBeInTheDocument()
    })
  })

  describe('rendering CommitsTable', () => {
    it('renders with table name heading', async () => {
      setup({ hasNextPage: true })
      repoPageRender({
        renderCommits: () => (
          <Wrapper>
            <CommitsTab />
          </Wrapper>
        ),
        initialEntries: ['/gh/codecov/gazebo/commits'],
      })

      const head = await screen.findByText(/Name/)
      expect(head).toBeInTheDocument()
    })

    it('renders with table coverage heading', async () => {
      setup({ hasNextPage: true })
      repoPageRender({
        renderCommits: () => (
          <Wrapper>
            <CommitsTab />
          </Wrapper>
        ),
        initialEntries: ['/gh/codecov/gazebo/commits'],
      })

      const head = await screen.findByText(/Coverage/)
      expect(head).toBeInTheDocument()
    })

    it('renders with table change heading', async () => {
      setup({ hasNextPage: true })
      repoPageRender({
        renderCommits: () => (
          <Wrapper>
            <CommitsTab />
          </Wrapper>
        ),
        initialEntries: ['/gh/codecov/gazebo/commits'],
      })

      const head = await screen.findByText(/Change/)
      expect(head).toBeInTheDocument()
    })

    describe('when select onLoadMore is triggered', () => {
      beforeEach(() => {
        useIntersection.mockReturnValue({
          isIntersecting: true,
        })
      })

      describe('when there is not a next page', () => {
        it('does not call fetchNextPage', async () => {
          const { user, fetchNextPage } = setup({ hasNextPage: false })
          repoPageRender({
            renderCommits: () => (
              <Wrapper>
                <CommitsTab />
              </Wrapper>
            ),
            initialEntries: ['/gh/codecov/gazebo/commits'],
          })

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

          repoPageRender({
            renderCommits: () => (
              <Wrapper>
                <CommitsTab />
              </Wrapper>
            ),
            initialEntries: ['/gh/codecov/gazebo/commits'],
          })

          const select = await screen.findByText('Select branch')
          await user.click(select)

          await waitFor(() => queryClient.isFetching)
          await waitFor(() => !queryClient.isFetching)

          await waitFor(() => expect(fetchNextPage).toBeCalled())
          await waitFor(() =>
            expect(fetchNextPage).toBeCalledWith('some cursor')
          )
        })
      })
    })

    describe('user selects from the branch selector', () => {
      describe('user selects All branches', () => {
        it('updates the button with the selected branch', async () => {
          const { user } = setup({ hasNextPage: false, returnBranch: 'main' })
          repoPageRender({
            renderCommits: () => (
              <Wrapper>
                <CommitsTab />
              </Wrapper>
            ),
            initialEntries: ['/gh/codecov/gazebo/commits'],
          })

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
          const { user } = setup({ hasNextPage: false, returnBranch: 'main' })
          repoPageRender({
            renderCommits: () => (
              <Wrapper>
                <CommitsTab />
              </Wrapper>
            ),
            initialEntries: ['/gh/codecov/gazebo/commits'],
          })

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
        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <CommitsTab />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/gazebo/commits'],
        })

        const select = await screen.findByRole('button', {
          name: 'Filter by CI states',
        })
        await user.click(select)

        const completeOption = await screen.findByRole('option', {
          name: 'Complete',
        })
        await user.click(completeOption)

        await waitFor(() =>
          expect(completeOption).toHaveClass('border-l-black')
        )
      })
    })

    describe('user searches for branch', () => {
      it('fetches request with search term', async () => {
        const { branchSearch, user } = setup({ hasNextPage: false })

        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <CommitsTab />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/gazebo/commits'],
        })

        const select = await screen.findByText('Select branch')
        await user.click(select)

        const search = await screen.findByPlaceholderText('Search for branches')
        await user.type(search, 'searching for a branch')

        await waitFor(() => expect(branchSearch).toBeCalled())
        await waitFor(() =>
          expect(branchSearch).toBeCalledWith('searching for a branch')
        )
      })

      it('hides All branches from list', async () => {
        const { branchSearch, user } = setup({ hasNextPage: false })

        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <CommitsTab />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/gazebo/commits'],
        })

        const select = await screen.findByRole('button', {
          name: 'Select branch',
        })
        await user.click(select)

        const search = await screen.findByPlaceholderText('Search for branches')
        await user.type(search, 'searching for a branch')

        await waitFor(() => expect(branchSearch).toBeCalled())

        const allCommits = screen.queryByText('All branches')
        expect(allCommits).not.toBeInTheDocument()
      })
    })

    describe('user searches for commit', () => {
      it('fetches commits request with search term', async () => {
        const { commitSearch, user } = setup({ hasNextPage: false })

        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <CommitsTab />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/gazebo/commits'],
        })

        const search = await screen.findByPlaceholderText('Search commits')
        await user.type(search, 'searching for a commit')

        await waitFor(() => expect(commitSearch).toBeCalled())
        await waitFor(() =>
          expect(commitSearch).toBeCalledWith('searching for a commit')
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
          repoPageRender({
            renderCommits: () => (
              <Wrapper>
                <CommitsTab />
              </Wrapper>
            ),
            initialEntries: ['/gh/codecov/gazebo/commits'],
          })

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
          repoPageRender({
            renderCommits: () => (
              <Wrapper>
                <CommitsTab />
              </Wrapper>
            ),
            initialEntries: ['/gh/codecov/gazebo/commits'],
          })

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
        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <CommitsTab />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/gazebo/commits'],
        })

        const select = await screen.findByRole('button', {
          name: 'Filter by CI states',
        })
        await user.click(select)

        const completeOption = await screen.findByRole('option', {
          name: 'Complete',
        })
        await user.click(completeOption)

        await waitFor(() =>
          expect(completeOption).toHaveClass('border-l-black')
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

        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <CommitsTab />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/gazebo/commits'],
        })

        const select = await screen.findByText('Select branch')
        await user.click(select)

        const search = await screen.findByPlaceholderText('Search for branches')
        await user.type(search, 'searching for a branch')

        await waitFor(() => expect(branchSearch).toBeCalled())
        await waitFor(() =>
          expect(branchSearch).toBeCalledWith('searching for a branch')
        )
      })

      it('hides All branches from list', async () => {
        const { branchSearch, user } = setup({
          hasNextPage: false,
          tierValue: TierNames.TEAM,
          isPrivate: true,
        })

        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <CommitsTab />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/gazebo/commits'],
        })

        const select = await screen.findByRole('button', {
          name: 'Select branch',
        })
        await user.click(select)

        const search = await screen.findByPlaceholderText('Search for branches')
        await user.type(search, 'searching for a branch')

        await waitFor(() => expect(branchSearch).toBeCalled())

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

        repoPageRender({
          renderCommits: () => (
            <Wrapper>
              <CommitsTab />
            </Wrapper>
          ),
          initialEntries: ['/gh/codecov/gazebo/commits'],
        })

        const search = await screen.findByPlaceholderText('Search commits')
        await user.type(search, 'searching for a commit')

        await waitFor(() => expect(commitSearch).toBeCalled())
        await waitFor(() =>
          expect(commitSearch).toBeCalledWith('searching for a commit')
        )
      })
    })
  })
})
