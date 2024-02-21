import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useBundleBranchSelector } from './useBundleBranchSelector'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

const mockBranches = (branchName?: string) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        name: branchName,
        head: {
          commitid: branchName === 'main' ? 'commit-123' : 'commit-321',
        },
      },
    },
  },
})

const branches = [
  { name: 'random-branch', head: { commitid: 'commit-321' } },
  { name: 'main', head: { commitid: 'commit-123' } },
]

const wrapper =
  (
    initialEntries = '/gh/codecov/cool-repo'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
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

interface SetupArgs {
  branchName?: string
  returnBranches?: boolean
}

describe('useBundleBranchSelector', () => {
  function setup({ branchName, returnBranches = true }: SetupArgs) {
    server.use(
      graphql.query('GetBranch', (req, res, ctx) => {
        if (returnBranches) {
          return res(ctx.status(200), ctx.data(mockBranches(branchName)))
        }

        return res(ctx.status(200), ctx.data({ owner: null }))
      })
    )
  }

  describe('with default branch', () => {
    const defaultBranch = 'main'

    it('sets the selected branch', async () => {
      setup({ branchName: defaultBranch, returnBranches: true })
      const { result } = renderHook(
        () => useBundleBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.selection).toEqual({
          name: 'main',
          head: { commitid: 'commit-123' },
        })
      )
    })

    it('sets the branchSelectorProps items correctly', async () => {
      setup({ branchName: defaultBranch, returnBranches: true })
      const { result } = renderHook(
        () => useBundleBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toEqual([
          { name: 'random-branch', head: { commitid: 'commit-321' } },
          { name: 'main', head: { commitid: 'commit-123' } },
        ])
      )
    })

    it('sets the branchSelectorProps value correctly', async () => {
      setup({ branchName: defaultBranch, returnBranches: true })
      const { result } = renderHook(
        () => useBundleBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.value).toEqual({
          name: 'main',
          head: { commitid: 'commit-123' },
        })
      )
    })

    it('formats the branchSelectorProps correctly', async () => {
      setup({ branchName: defaultBranch, returnBranches: true })
      const { result } = renderHook(
        () => useBundleBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toEqual([
          { name: 'random-branch', head: { commitid: 'commit-321' } },
          { name: 'main', head: { commitid: 'commit-123' } },
        ])
      )
    })
  })

  describe('with branch set', () => {
    it('sets the selected branch', async () => {
      setup({ branchName: 'random-branch', returnBranches: true })
      const defaultBranch = 'main'
      const { result } = renderHook(
        () => useBundleBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/tree/random-branch') }
      )

      await waitFor(() =>
        expect(result.current.selection).toStrictEqual({
          name: 'random-branch',
          head: { commitid: 'commit-321' },
        })
      )
    })

    it('sets the branchSelectorProps items correctly', async () => {
      setup({ branchName: 'random-branch', returnBranches: true })
      const defaultBranch = 'main'
      const { result } = renderHook(
        () => useBundleBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/tree/random-branch') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toEqual([
          { name: 'random-branch', head: { commitid: 'commit-321' } },
          { name: 'main', head: { commitid: 'commit-123' } },
        ])
      )
    })

    it('sets the branchSelectorProps value correctly', async () => {
      setup({ branchName: 'random-branch', returnBranches: true })
      const defaultBranch = 'main'
      const { result } = renderHook(
        () => useBundleBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/tree/random-branch') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.value).toEqual({
          name: 'random-branch',
          head: { commitid: 'commit-321' },
        })
      )
    })

    it('formats the branchSelectorProps correctly', async () => {
      setup({ branchName: 'random-branch', returnBranches: true })
      const defaultBranch = 'main'
      const { result } = renderHook(
        () => useBundleBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/tree/random-branch') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toEqual([
          { name: 'random-branch', head: { commitid: 'commit-321' } },
          { name: 'main', head: { commitid: 'commit-123' } },
        ])
      )
    })
  })

  describe('with ref set', () => {
    it('sets the selected branch', async () => {
      setup({ branchName: 'random-branch', returnBranches: true })
      const defaultBranch = 'main'
      const { result } = renderHook(
        () => useBundleBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/random-branch/file.js') }
      )

      await waitFor(() =>
        expect(result.current.selection).toStrictEqual({
          name: 'random-branch',
          head: { commitid: 'commit-321' },
        })
      )
    })

    it('sets the branchSelectorProps items correctly', async () => {
      setup({ branchName: 'random-branch', returnBranches: true })
      const defaultBranch = 'main'
      const { result } = renderHook(
        () => useBundleBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/random-branch/file.js') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toStrictEqual([
          { name: 'random-branch', head: { commitid: 'commit-321' } },
          { name: 'main', head: { commitid: 'commit-123' } },
        ])
      )
    })

    it('sets the branchSelectorProps value correctly', async () => {
      setup({ branchName: 'random-branch', returnBranches: true })
      const defaultBranch = 'main'
      const { result } = renderHook(
        () => useBundleBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/random-branch/file.js') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.value).toStrictEqual({
          name: 'random-branch',
          head: { commitid: 'commit-321' },
        })
      )
    })

    it('formats the branchSelectorProps correctly', async () => {
      setup({ branchName: 'random-branch', returnBranches: true })
      const defaultBranch = 'main'
      const { result } = renderHook(
        () => useBundleBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/random-branch/file.js') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toStrictEqual([
          { name: 'random-branch', head: { commitid: 'commit-321' } },
          { name: 'main', head: { commitid: 'commit-123' } },
        ])
      )
    })
  })

  describe('branches is undefined', () => {
    it('returns undefined selection', async () => {
      setup({ branchName: 'branchName', returnBranches: false })
      const defaultBranch = 'random-branch'
      const { result } = renderHook(
        () => useBundleBranchSelector({ defaultBranch, branches: null }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/random-branch/file.js') }
      )

      await waitFor(() =>
        expect(result.current.selection).toStrictEqual({
          name: 'Select branch',
          head: null,
        })
      )
    })
  })
})
