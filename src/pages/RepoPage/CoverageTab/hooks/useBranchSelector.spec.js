import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'

import { useBranchSelector } from './useBranchSelector'

const wrapper =
  (initialEntries = '/gh/codecov/cool-repo') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/blob/:ref/:path+',
            '/:provider/:owner/:repo/tree/:branch',
            '/:provider/:owner/:repo',
          ]}
        >
          {children}
        </Route>
      </MemoryRouter>
    )

describe('useBranchSelector', () => {
  describe('with default branch', () => {
    it('sets the selected branch', () => {
      const branches = [{ name: 'fcg' }, { name: 'imogen' }]
      const defaultBranch = 'imogen'
      const defaultBranchEntry = { name: 'imogen' }
      const { result } = renderHook(
        () =>
          useBranchSelector({ branches, defaultBranch, defaultBranchEntry }),
        { wrapper: wrapper() }
      )

      expect(result.current.selection).toEqual({ name: 'imogen' })
    })

    it('sets the branchSelectorProps items correctly', () => {
      const branches = [{ name: 'fcg' }, { name: 'imogen' }]
      const defaultBranch = 'imogen'
      const defaultBranchEntry = { name: 'imogen' }
      const { result } = renderHook(
        () =>
          useBranchSelector({ branches, defaultBranch, defaultBranchEntry }),
        { wrapper: wrapper() }
      )

      expect(result.current.branchSelectorProps.items).toEqual([
        { name: 'fcg' },
        { name: 'imogen' },
      ])
    })

    it('sets the branchSelectorProps value correctly', async () => {
      const branches = [{ name: 'fcg' }, { name: 'imogen' }]
      const defaultBranch = 'imogen'
      const defaultBranchEntry = { name: 'imogen' }
      const { result, waitFor } = renderHook(
        () =>
          useBranchSelector({ branches, defaultBranch, defaultBranchEntry }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.value).toEqual({
          name: 'imogen',
        })
      )
    })

    it('formats the branchSelectorProps correctly', async () => {
      const branches = [{ name: 'fcg' }, { name: 'imogen' }]
      const defaultBranch = 'imogen'
      const defaultBranchEntry = { name: 'imogen' }
      const { result, waitFor } = renderHook(
        () =>
          useBranchSelector({ branches, defaultBranch, defaultBranchEntry }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toEqual([
          { name: 'fcg' },
          { name: 'imogen' },
        ])
      )
    })
  })

  describe('with branch set', () => {
    it('sets the selected branch', () => {
      const branches = [{ name: 'fcg' }, { name: 'imogen' }]
      const defaultBranch = 'imogen'
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/tree/fcg') }
      )

      expect(result.current.selection).toEqual({ name: 'fcg' })
    })

    it('sets the branchSelectorProps items correctly', () => {
      const branches = [{ name: 'fcg' }, { name: 'imogen' }]
      const defaultBranch = 'imogen'
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/tree/fcg') }
      )

      expect(result.current.branchSelectorProps.items).toEqual([
        { name: 'fcg' },
        { name: 'imogen' },
      ])
    })

    it('sets the branchSelectorProps value correctly', async () => {
      const branches = [{ name: 'fcg' }, { name: 'imogen' }]
      const defaultBranch = 'imogen'
      const { result, waitFor } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/tree/fcg') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.value).toEqual({
          name: 'fcg',
        })
      )
    })

    it('formats the branchSelectorProps correctly', async () => {
      const branches = [{ name: 'fcg' }, { name: 'imogen' }]
      const defaultBranch = 'imogen'
      const { result, waitFor } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/tree/fcg') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toEqual([
          { name: 'fcg' },
          { name: 'imogen' },
        ])
      )
    })
  })

  describe('with ref set', () => {
    it('sets the selected branch', () => {
      const branches = [{ name: 'fcg' }, { name: 'imogen' }]
      const defaultBranch = 'imogen'
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/fcg/file.js') }
      )

      expect(result.current.selection).toEqual({ name: 'fcg' })
    })

    it('sets the branchSelectorProps items correctly', () => {
      const branches = [{ name: 'fcg' }, { name: 'imogen' }]
      const defaultBranch = 'imogen'
      const { result } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/fcg/file.js') }
      )

      expect(result.current.branchSelectorProps.items).toEqual([
        { name: 'fcg' },
        { name: 'imogen' },
      ])
    })

    it('sets the branchSelectorProps value correctly', async () => {
      const branches = [{ name: 'fcg' }, { name: 'imogen' }]
      const defaultBranch = 'imogen'
      const { result, waitFor } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/fcg/file.js') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.value).toEqual({
          name: 'fcg',
        })
      )
    })

    it('formats the branchSelectorProps correctly', async () => {
      const branches = [{ name: 'fcg' }, { name: 'imogen' }]
      const defaultBranch = 'imogen'
      const { result, waitFor } = renderHook(
        () => useBranchSelector({ branches, defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/fcg/file.js') }
      )

      await waitFor(() =>
        expect(result.current.branchSelectorProps.items).toEqual([
          { name: 'fcg' },
          { name: 'imogen' },
        ])
      )
    })
  })

  describe('branches is undefined', () => {
    it('returns undefined selection', () => {
      const defaultBranch = 'fcg'
      const { result } = renderHook(
        () => useBranchSelector({ defaultBranch }),
        { wrapper: wrapper('/gh/codecov/cool-repo/blob/fcg/file.js') }
      )

      expect(result.current.selection).toBeUndefined()
    })
  })
})
