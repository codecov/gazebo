import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import BranchSelector from './BranchSelector'

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

const mockRepoOverview = {
  __typename: 'Repository',
  private: false,
  defaultBranch: 'main',
  oldestCommitAt: '2022-10-10T11:59:59',
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
  languages: [],
  testAnalyticsEnabled: true,
}

const mockMainBranchSearch = {
  __typename: 'Repository',
  branches: {
    edges: [
      {
        node: {
          name: 'main',
          head: {
            commitid: '321fdsa',
          },
        },
      },
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'end-cursor',
    },
  },
}

const mockBranch = (name: string) => ({
  branch: {
    name: name,
    head: {
      commitid: '321fdsa',
    },
  },
})

const mockBranches = (hasNextPage = false) => ({
  __typename: 'Repository',
  branches: {
    edges: [
      {
        node: {
          name: 'branch-1',
          head: {
            commitid: 'asdf123',
          },
        },
      },
      {
        node: {
          name: 'main',
          head: {
            commitid: '321fdsa',
          },
        },
      },
    ],
    pageInfo: {
      hasNextPage: hasNextPage,
      endCursor: 'end-cursor',
    },
  },
})

const server = setupServer()
let testLocation: ReturnType<typeof useLocation>
const wrapper =
  (
    queryClient: QueryClient,
    initialEntries = '/gh/codecov/test-repo/components'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path={['/:provider/:owner/:repo/components']}>
          <Suspense fallback={<p>loading</p>}>{children}</Suspense>
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
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  hasNextPage?: boolean
  nullOverview?: boolean
}

describe('BranchSelector', () => {
  function setup(
    { hasNextPage = false, nullOverview = false }: SetupArgs = {
      hasNextPage: false,
      nullOverview: false,
    }
  ) {
    const user = userEvent.setup()
    const fetchNextPage = vi.fn()
    const mockSearching = vi.fn()

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          suspense: true,
          retry: false,
        },
      },
    })

    server.use(
      graphql.query('GetRepoOverview', () => {
        if (nullOverview) {
          return HttpResponse.json({ data: { owner: null } })
        }

        return HttpResponse.json({
          data: {
            owner: {
              isCurrentUserActivated: true,
              repository: mockRepoOverview,
            },
          },
        })
      }),
      graphql.query('GetBranch', (info) => {
        let branch = 'main'
        if (info.variables?.branch) {
          branch = info.variables?.branch
        }

        return HttpResponse.json({
          data: {
            owner: {
              repository: { __typename: 'Repository', ...mockBranch(branch) },
            },
          },
        })
      }),
      graphql.query('GetBranches', (info) => {
        if (info.variables?.after) {
          fetchNextPage(info.variables?.after)
        }

        if (info.variables?.filters?.searchValue === 'main') {
          return HttpResponse.json({
            data: { owner: { repository: mockMainBranchSearch } },
          })
        }

        if (info.variables?.filters?.searchValue) {
          mockSearching(info.variables?.filters?.searchValue)
        }

        return HttpResponse.json({
          data: { owner: { repository: mockBranches(hasNextPage) } },
        })
      })
    )

    return {
      fetchNextPage,
      mockSearching,
      user,
      queryClient,
    }
  }

  describe('with populated data', () => {
    it('renders the branch selector', async () => {
      const { queryClient } = setup()
      render(<BranchSelector isDisabled={false} />, {
        wrapper: wrapper(queryClient),
      })

      const branchContext = await screen.findByText(/Branch Context/)
      expect(branchContext).toBeInTheDocument()
    })

    it('renders default branch as selected branch', async () => {
      const { queryClient } = setup()
      render(<BranchSelector isDisabled={false} />, {
        wrapper: wrapper(queryClient),
      })

      const dropDownBtn = await screen.findByText('main')
      expect(dropDownBtn).toBeInTheDocument()
    })
  })

  describe('navigating branches', () => {
    describe('user selects a branch', () => {
      it('updates params with selected branch', async () => {
        const { user, queryClient } = setup()
        render(<BranchSelector isDisabled={false} />, {
          wrapper: wrapper(queryClient),
        })

        const select = await screen.findByRole('button', {
          name: 'components branch selector',
        })
        await user.click(select)

        const branch = await screen.findByText('branch-1')
        await user.click(branch)

        await waitFor(() => {
          expect(testLocation?.pathname).toStrictEqual(
            '/gh/codecov/test-repo/components/branch-1'
          )
        })
      })
    })
  })

  describe('when onLoadMore is triggered', () => {
    describe('when there is not a next page', () => {
      it('does not call fetchNextPage', async () => {
        const { user, fetchNextPage, queryClient } = setup({
          hasNextPage: false,
        })

        mocks.useIntersection.mockReturnValue({
          isIntersecting: true,
        })

        render(<BranchSelector isDisabled={false} />, {
          wrapper: wrapper(queryClient),
        })

        const select = await screen.findByRole('button', {
          name: 'components branch selector',
        })
        await user.click(select)

        await waitFor(() => expect(fetchNextPage).not.toHaveBeenCalled())
      })
    })

    describe('there is a next page', () => {
      it('calls fetchNextPage', async () => {
        const { fetchNextPage, user, queryClient } = setup({
          hasNextPage: true,
        })

        mocks.useIntersection.mockReturnValue({
          isIntersecting: true,
        })

        render(<BranchSelector isDisabled={false} />, {
          wrapper: wrapper(queryClient),
        })

        const select = await screen.findByRole('button', {
          name: 'components branch selector',
        })
        await user.click(select)

        await waitFor(() => expect(fetchNextPage).toHaveBeenCalled())
      })
    })
  })

  describe('user searches for branch', () => {
    it('calls the api with the search value', async () => {
      const { mockSearching, user, queryClient } = setup()
      render(<BranchSelector isDisabled={false} />, {
        wrapper: wrapper(queryClient),
      })

      const select = await screen.findByText('main')
      await user.click(select)

      const input = await screen.findByRole('combobox')
      await user.type(input, 'searching for branch')

      await waitFor(() =>
        expect(mockSearching).toHaveBeenCalledWith('searching for branch')
      )
    })
  })

  describe('when the branch is not found', () => {
    it('displays select a branch in the button', async () => {
      const { queryClient } = setup({
        nullOverview: true,
      })
      render(<BranchSelector isDisabled={false} />, {
        wrapper: wrapper(queryClient),
      })

      const select = await screen.findByRole('button', {
        name: 'components branch selector',
      })

      expect(select).toHaveTextContent('Select branch')
    })
  })
})
