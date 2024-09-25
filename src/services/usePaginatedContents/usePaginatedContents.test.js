import { renderHook } from '@testing-library/react'

import { usePaginatedContents } from './usePaginatedContents'

const mockData = [
  {
    name: 'flag2',
    filepath: 'flag2',
    percentCovered: 92.78,
    __typename: 'PathContentFile',
    hits: 4,
    misses: 2,
    lines: 7,
    partials: 1,
  },
  {
    name: 'flag',
    filepath: 'subfolder/folder/flag1',
    percentCovered: 92.78,
    __typename: 'PathContentFile',
    hits: 2,
    misses: 5,
    lines: 6,
    partials: 1,
  },
  {
    name: 'flag3',
    filepath: 'a/b/c/d/e/f/g/flag3',
    percentCovered: 92.78,
    __typename: 'PathContentFile',
    hits: 4,
    misses: 2,
    lines: 7,
    partials: 1,
  },
]

describe('useShouldRenderTabs', () => {
  describe('When renderering less than 25 items', () => {
    it('returns all 25 items', () => {
      const { result } = renderHook(() =>
        usePaginatedContents({ data: mockData })
      )
      expect(result.current).toBeTruthy()
      expect(result.current.paginatedData).toHaveLength(3)
      expect(result.current.paginatedData).toEqual(mockData)
      expect(result.current.hasNextPage).toEqual(false)
    })
  })

  describe('When rendering more than 25 items', () => {
    const bigArray = new Array(26).fill({
      name: 'flag2',
      filepath: 'flag2',
      percentCovered: 92.78,
      __typename: 'PathContentFile',
      hits: 4,
      misses: 2,
      lines: 7,
      partials: 1,
    })

    it('returns all 25 items', () => {
      const { result } = renderHook(() =>
        usePaginatedContents({ data: bigArray })
      )

      expect(result.current).toBeTruthy()
      expect(result.current.paginatedData).toHaveLength(25)
      expect(result.current.hasNextPage).toEqual(true)
    })
  })
})
