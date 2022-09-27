import { renderHook } from '@testing-library/react-hooks'

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
  let hookData
  function setup({ data = mockData }) {
    hookData = renderHook(() => usePaginatedContents({ data }))
  }

  describe('When renderering less than 25 items', () => {
    beforeEach(() => {
      setup({ data: mockData })
    })

    it('returns all 25 items', () => {
      expect(hookData.result.current).toBeTruthy()
      expect(hookData.result.current.paginatedData).toHaveLength(3)
      expect(hookData.result.current.paginatedData).toEqual(mockData)
      expect(hookData.result.current.hasNextPage).toEqual(false)
    })
  })

  describe('When renderering more than 25 items', () => {
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
    beforeEach(() => {
      setup({ data: bigArray })
    })

    it('returns all 25 items', () => {
      expect(hookData.result.current).toBeTruthy()
      expect(hookData.result.current.paginatedData).toHaveLength(25)
      expect(hookData.result.current.hasNextPage).toEqual(true)
    })
  })
})
