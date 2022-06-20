import { renderHook } from '@testing-library/react-hooks'
import { useParams } from 'react-router-dom'

import { useBranchSelector } from './useBranchSelector'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}))

describe('useBranchSelector', () => {
  let hookData

  function setup({ branches, defaultBranch, useParamsValue = {} }) {
    useParams.mockReturnValue(useParamsValue)

    hookData = renderHook(() => useBranchSelector(branches, defaultBranch))
  }

  describe('with default branch', () => {
    beforeEach(() => {
      setup({
        branches: {
          edges: [{ node: { name: 'fcg' } }, { node: { name: 'imogen' } }],
        },
        defaultBranch: 'imogen',
      })

      return hookData.waitFor(() => hookData.result.current.items)
    })
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('sets the selected branch', () => {
      expect(hookData.result.current.selection).toEqual({ name: 'imogen' })
    })

    it('sets the branchSelectorProps items correctly', () => {
      expect(hookData.result.current.branchSelectorProps.items).toEqual([
        { name: 'fcg' },
        { name: 'imogen' },
      ])
    })

    it('sets the branchSelectorProps value correctly', async () => {
      await hookData.waitFor(() =>
        expect(hookData.result.current.branchSelectorProps.value).toEqual({
          name: 'imogen',
        })
      )
    })

    it('formats the branchSelectorProps correctly', async () => {
      await hookData.waitFor(() =>
        expect(hookData.result.current.branchSelectorProps.items).toEqual([
          { name: 'fcg' },
          { name: 'imogen' },
        ])
      )
    })
  })

  describe('with branch set', () => {
    beforeEach(() => {
      setup({
        branches: {
          edges: [{ node: { name: 'fcg' } }, { node: { name: 'imogen' } }],
        },
        defaultBranch: 'imogen',
        useParamsValue: { branch: 'fcg' },
      })

      return hookData.waitFor(() => hookData.result.current.items)
    })
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('sets the selected branch', () => {
      expect(hookData.result.current.selection).toEqual({ name: 'fcg' })
    })

    it('sets the branchSelectorProps items correctly', () => {
      expect(hookData.result.current.branchSelectorProps.items).toEqual([
        { name: 'fcg' },
        { name: 'imogen' },
      ])
    })

    it('sets the branchSelectorProps value correctly', async () => {
      await hookData.waitFor(() =>
        expect(hookData.result.current.branchSelectorProps.value).toEqual({
          name: 'fcg',
        })
      )
    })

    it('formats the branchSelectorProps correctly', async () => {
      await hookData.waitFor(() =>
        expect(hookData.result.current.branchSelectorProps.items).toEqual([
          { name: 'fcg' },
          { name: 'imogen' },
        ])
      )
    })
  })

  describe('with ref set', () => {
    beforeEach(() => {
      setup({
        branches: {
          edges: [{ node: { name: 'fcg' } }, { node: { name: 'imogen' } }],
        },
        defaultBranch: 'imogen',
        useParamsValue: { ref: 'fcg' },
      })

      return hookData.waitFor(() => hookData.result.current.items)
    })
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('sets the selected branch', () => {
      expect(hookData.result.current.selection).toEqual({ name: 'fcg' })
    })

    it('sets the branchSelectorProps items correctly', () => {
      expect(hookData.result.current.branchSelectorProps.items).toEqual([
        { name: 'fcg' },
        { name: 'imogen' },
      ])
    })

    it('sets the branchSelectorProps value correctly', async () => {
      await hookData.waitFor(() =>
        expect(hookData.result.current.branchSelectorProps.value).toEqual({
          name: 'fcg',
        })
      )
    })

    it('formats the branchSelectorProps correctly', async () => {
      await hookData.waitFor(() =>
        expect(hookData.result.current.branchSelectorProps.items).toEqual([
          { name: 'fcg' },
          { name: 'imogen' },
        ])
      )
    })
  })
})
