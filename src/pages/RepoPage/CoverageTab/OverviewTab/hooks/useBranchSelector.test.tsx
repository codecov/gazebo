import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useBranchSelector } from './useBranchSelector'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

const mockBranches = (branchName: string) => ({
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

const branches = [
  { name: 'fcg', head: { commitid: 'commit-321' } },
  { name: 'imogen', head: { commitid: 'commit-123' } },
]

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh/codecov/cool-repo') =>
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

describe('useBranchSelector', () => {
  function setup(branchName: string, returnBranches: boolean = true) {
    server.use(
      graphql.query('GetBranch', (info) => {
        if (returnBranches) {
          return HttpResponse.json({ data: mockBranches(branchName) })
        }

        return HttpResponse.json({ data: { owner: null } })
      })
    )
  }

  describe('with default branch', () => {
    const defaultBranch = 'imogen'
    beforeEach(() => setup(defaultBranch, true))

    it('sets the selected branch', async () => {
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.selection).toEqual({
          name: 'imogen',
          head: { commitid: 'commit-123' },
        })
      )
    })

    it('sets the branchSelectorProps items correctly', async () => {
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toEqual([
          { name: 'fcg', head: { commitid: 'commit-321' } },
          { name: 'imogen', head: { commitid: 'commit-123' } },
        ])
      )
    })

    it('sets the branchSelectorProps value correctly', async () => {
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.value).toEqual({
          name: 'imogen',
          head: { commitid: 'commit-123' },
        })
      )
    })

    it('formats the branchSelectorProps correctly', async () => {
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toEqual([
          { name: 'fcg', head: { commitid: 'commit-321' } },
          { name: 'imogen', head: { commitid: 'commit-123' } },
        ])
      )
    })
  })

  describe('with branch set', () => {
    beforeEach(() => setup('fcg', true))

    it('sets the selected branch', async () => {
      const defaultBranch = 'imogen'
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/tree/fcg') }
      )

      await waitFor(() =>
        expect(result.current.selection).toStrictEqual({
          name: 'fcg',
          head: { commitid: 'commit-321' },
        })
      )
    })

    it('sets the branchSelectorProps items correctly', async () => {
      const defaultBranch = 'imogen'
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/tree/fcg') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toEqual([
          { name: 'fcg', head: { commitid: 'commit-321' } },
          { name: 'imogen', head: { commitid: 'commit-123' } },
        ])
      )
    })

    it('sets the branchSelectorProps value correctly', async () => {
      const defaultBranch = 'imogen'
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/tree/fcg') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.value).toEqual({
          name: 'fcg',
          head: { commitid: 'commit-321' },
        })
      )
    })

    it('formats the branchSelectorProps correctly', async () => {
      const defaultBranch = 'imogen'
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/tree/fcg') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toEqual([
          { name: 'fcg', head: { commitid: 'commit-321' } },
          { name: 'imogen', head: { commitid: 'commit-123' } },
        ])
      )
    })
  })

  describe('with ref set', () => {
    beforeEach(() => setup('fcg', true))

    it('sets the selected branch', async () => {
      const defaultBranch = 'imogen'
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/fcg/file.js') }
      )

      await waitFor(() =>
        expect(result.current.selection).toStrictEqual({
          name: 'fcg',
          head: { commitid: 'commit-321' },
        })
      )
    })

    it('sets the branchSelectorProps items correctly', async () => {
      const defaultBranch = 'imogen'
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/fcg/file.js') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toStrictEqual([
          { name: 'fcg', head: { commitid: 'commit-321' } },
          { name: 'imogen', head: { commitid: 'commit-123' } },
        ])
      )
    })

    it('sets the branchSelectorProps value correctly', async () => {
      const defaultBranch = 'imogen'
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/fcg/file.js') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.value).toStrictEqual({
          name: 'fcg',
          head: { commitid: 'commit-321' },
        })
      )
    })

    it('formats the branchSelectorProps correctly', async () => {
      const defaultBranch = 'imogen'
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/fcg/file.js') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toStrictEqual([
          { name: 'fcg', head: { commitid: 'commit-321' } },
          { name: 'imogen', head: { commitid: 'commit-123' } },
        ])
      )
    })
  })

  describe('branches is undefined', () => {
    beforeEach(() => setup('branchName', false))

    it('returns null selection', async () => {
      const defaultBranch = 'fcg'
      const { result } = renderHook(
        () => useBranchSelector({ branches: [], defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/fcg/file.js') }
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
