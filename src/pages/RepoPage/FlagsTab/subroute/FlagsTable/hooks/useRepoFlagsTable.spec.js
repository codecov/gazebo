import { renderHook } from '@testing-library/react-hooks'

import { useRepoFlags } from 'services/repo/useRepoFlags'

import useRepoFlagsTable from './useRepoFlagsTable'

jest.mock('services/repo/useRepoFlags')

const flagsData = [
  {
    node: {
      name: 'flag1',
      percentCovered: 93.26,
      measurements: [],
    },
  },
  {
    node: {
      name: 'flag2',
      percentCovered: 91.74,
      measurements: [],
    },
  },
]

const fetchNextPage = jest.fn()

const repoFlagsMock = {
  data: flagsData,
  isLoading: false,
  fetchNextPage: fetchNextPage,
  hasNextPage: true,
  isFetchingNextPage: false,
}

const emptyRepoFlagsMock = {
  data: [],
}

describe('useFlagsRepoTable', () => {
  let hookData
  function setup({ repoData }) {
    useRepoFlags.mockReturnValue(repoData)

    hookData = renderHook(() => useRepoFlagsTable())
  }

  it('returns data accordingly', () => {
    setup({ repoData: repoFlagsMock })
    expect(hookData.result.current.data).toEqual(flagsData)
    expect(hookData.result.current.isLoading).toEqual(false)
    expect(hookData.result.current.hasNextPage).toEqual(true)
    expect(hookData.result.current.isFetchingNextPage).toEqual(false)
    expect(hookData.result.current.fetchNextPage).toEqual(fetchNextPage)
  })

  describe('when there is no data', () => {
    it('returns an empty array', () => {
      setup({ repoData: emptyRepoFlagsMock })
      expect(hookData.result.current.data).toEqual([])
    })
  })
})
