import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useCommitsTabBranchSelector } from './useCommitsTabBranchSelector'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

const mockMainBranchSearch = {
  __typename: 'Repository',
  branches: {
    edges: [
      {
        node: {
          name: 'main',
          head: { commitid: '321fdsa' },
        },
      },
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'end-cursor',
    },
  },
}

const mockBranches = {
  __typename: 'Repository',
  branches: {
    edges: [
      {
        node: {
          name: 'branch-1',
          head: { commitid: 'asdf123' },
        },
      },
      {
        node: {
          name: 'main',
          head: { commitid: '321fdsa' },
        },
      },
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'end-cursor',
    },
  },
}

const mockBranch = (branchName: string) => ({
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

const wrapper =
  (
    initialEntries = '/gh/codecov/cool-repo'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/blob/:ref/:path+',
            '/:provider/:owner/:repo/tree/:branch',
            '/:provider/:owner/:repo',
          ]}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
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

describe('useCommitsTabBranchSelector', () => {
  function setup(
    branchName: string,
    returnBranch = true,
    hasNoBranches = false
  ) {
    server.use(
      graphql.query('GetBranch', (info) => {
        if (returnBranch) {
          return HttpResponse.json({ data: mockBranch(branchName) })
        }

        return HttpResponse.json({ data: { owner: null } })
      }),
      graphql.query('GetBranches', (info) => {
        if (hasNoBranches) {
          return HttpResponse.json({ data: {} })
        }

        if (info.variables?.filters?.searchValue === 'main') {
          return HttpResponse.json({
            data: { owner: { repository: mockMainBranchSearch } },
          })
        }

        return HttpResponse.json({
          data: { owner: { repository: mockBranches } },
        })
      })
    )
  }

  describe('with default branch', () => {
    const defaultBranch = 'branch-1'
    const passedBranch = 'main'
    beforeEach(() => setup(defaultBranch, true))

    it('sets the selected branch', async () => {
      const { result } = renderHook(
        () => useCommitsTabBranchSelector({ passedBranch, defaultBranch }),
        { wrapper: wrapper() }
      )

      await waitFor(() => expect(result.current.selection).toEqual('branch-1'))
    })

    it('sets the branchSelectorProps items correctly', async () => {
      const { result } = renderHook(
        () => useCommitsTabBranchSelector({ passedBranch, defaultBranch }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toEqual([
          'branch-1',
          'main',
        ])
      )
    })

    it('sets the branchSelectorProps value correctly', async () => {
      const { result } = renderHook(
        () => useCommitsTabBranchSelector({ passedBranch, defaultBranch }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.value).toEqual('branch-1')
      )
    })
  })

  describe('with branch set', () => {
    const defaultBranch = 'main'
    const passedBranch = 'branch-1'
    beforeEach(() => setup('branch-1', true))

    it('sets the selected branch', async () => {
      const { result } = renderHook(
        () => useCommitsTabBranchSelector({ passedBranch, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/commits?branch=branch-1') }
      )

      await waitFor(() =>
        expect(result.current.selection).toStrictEqual('branch-1')
      )
    })

    it('sets the branchSelectorProps items correctly', async () => {
      const { result } = renderHook(
        () => useCommitsTabBranchSelector({ passedBranch, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/commits?branch=branch-1') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toEqual([
          'branch-1',
          'main',
        ])
      )
    })

    it('sets the branchSelectorProps value correctly', async () => {
      const { result } = renderHook(
        () => useCommitsTabBranchSelector({ passedBranch, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/commits?branch=branch-1') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.value).toEqual('branch-1')
      )
    })
  })

  describe('branches is undefined', () => {
    const defaultBranch = 'main'
    const passedBranch = 'blah'
    beforeEach(() => setup('branchName', false))

    it('returns undefined selection', async () => {
      const { result } = renderHook(
        () =>
          useCommitsTabBranchSelector({
            passedBranch,
            defaultBranch,
            isAllCommits: false,
          }),
        { wrapper: wrapper('/gh/codecov/cool-repo/commits?branch=branchName') }
      )

      await waitFor(() =>
        expect(result.current.selection).toStrictEqual('Select branch')
      )
    })
  })

  describe('isAllCommits is true', () => {
    const defaultBranch = 'main'
    const passedBranch = 'blah'
    beforeEach(() => setup('branchName', false))

    it('returns All branches as selection', async () => {
      const { result } = renderHook(
        () =>
          useCommitsTabBranchSelector({
            passedBranch,
            defaultBranch,
            isAllCommits: true,
          }),
        { wrapper: wrapper('/gh/codecov/cool-repo/commits?branch=branchName') }
      )

      await waitFor(() =>
        expect(result.current.selection).toStrictEqual('All branches')
      )
    })
  })
})
