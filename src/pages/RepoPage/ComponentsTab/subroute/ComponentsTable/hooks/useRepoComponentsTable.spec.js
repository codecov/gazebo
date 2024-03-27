import { renderHook, waitFor } from '@testing-library/react'
import { format, subDays, subMonths } from 'date-fns'
import { useParams } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useLocationParams } from 'services/navigation'
import { useRepo } from 'services/repo'
import { useRepoFlags } from 'services/repo/useRepoFlags'

import useRepoComponentsTable from './useRepoComponentsTable'

jest.mock('services/repo/useRepoFlags')
jest.mock('services/repo')

jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}))

const componentsData = [
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
  data: componentsData,
  isLoading: false,
  fetchNextPage: fetchNextPage,
  hasNextPage: true,
  isFetchingNextPage: false,
}

const emptyRepoFlagsMock = {
  data: [],
}

describe('useRepoComponentsTable', () => {
  function setup({
    repoData,
    useParamsValue = { search: '', historicalTrend: '', flags: [] },
  }) {
    useParams.mockReturnValue({
      provider: 'gh',
      owner: 'codecov',
      repo: 'gazebo',
    })
    useRepo.mockReturnValue({
      data: {
        repository: { oldestCommitAt: '2020-06-11T18:28:52' },
      },
    })

    useRepoFlags.mockReturnValue(repoData)
    useLocationParams.mockReturnValue({
      params: useParamsValue,
    })
  }

  it('returns data accordingly', () => {
    setup({ repoData: repoFlagsMock })

    const { result } = renderHook(() => useRepoComponentsTable())

    expect(result.current.data).toEqual(componentsData)
    expect(result.current.isLoading).toEqual(false)
    expect(result.current.hasNextPage).toEqual(true)
    expect(result.current.isFetchingNextPage).toEqual(false)
    expect(result.current.fetchNextPage).toEqual(fetchNextPage)
  })

  describe('when there is no data', () => {
    it('returns an empty array', () => {
      setup({ repoData: emptyRepoFlagsMock })
      const { result } = renderHook(() => useRepoComponentsTable())

      expect(result.current.data).toEqual([])
    })
  })

  describe('when handleSort is triggered', () => {
    beforeEach(() => {
      setup({ repoData: emptyRepoFlagsMock })
    })

    it('calls useRepoComponentsTable with desc value', async () => {
      const { result } = renderHook(() => useRepoComponentsTable(true))

      act(() => {
        result.current.handleSort([{ desc: true }])
      })

      await waitFor(() =>
        expect(useRepoFlags).toHaveBeenCalledWith({
          afterDate: '2020-06-11',
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '', flagsNames: [] },
          interval: 'INTERVAL_30_DAY',
          orderingDirection: 'DESC',
          suspense: false,
        })
      )
    })

    it('calls useRepoComponentsTable with asc value when the array is empty', async () => {
      const { result } = renderHook(() => useRepoComponentsTable())

      act(() => {
        result.current.handleSort([])
      })

      await waitFor(() =>
        expect(useRepoFlags).toHaveBeenCalledWith({
          afterDate: '2020-06-11',
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '', flagsNames: [] },
          interval: 'INTERVAL_30_DAY',
          orderingDirection: 'ASC',
          suspense: false,
        })
      )
    })

    it('calls useRepoComponentsTable with asc value', async () => {
      const { result } = renderHook(() => useRepoComponentsTable(true))

      act(() => {
        result.current.handleSort([{ desc: false }])
      })

      await waitFor(() =>
        expect(useRepoFlags).toHaveBeenCalledWith({
          afterDate: '2020-06-11',
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '', flagsNames: [] },
          interval: 'INTERVAL_30_DAY',
          orderingDirection: 'ASC',
          suspense: false,
        })
      )
    })
  })

  describe('when there is search param', () => {
    it('calls useRepoComponentsTable with correct filters value', () => {
      setup({
        repoData: repoFlagsMock,
        useParamsValue: { search: 'flag1' },
      })

      const { result } = renderHook(() => useRepoComponentsTable())

      expect(result.current.isSearching).toEqual(true)
      expect(useRepoFlags).toHaveBeenCalledWith({
        afterDate: '2020-06-11',
        beforeDate: format(new Date(), 'yyyy-MM-dd'),
        filters: { term: 'flag1' },
        interval: 'INTERVAL_30_DAY',
        orderingDirection: 'ASC',
        suspense: false,
      })
    })
  })

  describe('historical trend', () => {
    describe('when historical trend param is empty or all time is selected', () => {
      beforeEach(() => {
        setup({
          repoData: repoFlagsMock,
        })
      })

      it('calls useRepoComponentsTable with correct query params', () => {
        renderHook(() => useRepoComponentsTable())

        expect(useRepoFlags).toHaveBeenCalledWith({
          afterDate: '2020-06-11',
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '', flagsNames: [] },
          interval: 'INTERVAL_30_DAY',
          orderingDirection: 'ASC',
          suspense: false,
        })
      })
    })

    describe('when 6 months is selected', () => {
      beforeEach(() => {
        setup({
          repoData: repoFlagsMock,
          useParamsValue: { historicalTrend: 'LAST_6_MONTHS', search: '' },
        })
      })

      it('calls useRepoComponentsTable with correct query params', () => {
        renderHook(() => useRepoComponentsTable())

        const afterDate = format(subMonths(new Date(), 6), 'yyyy-MM-dd')
        expect(useRepoFlags).toHaveBeenCalledWith({
          afterDate,
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '' },
          interval: 'INTERVAL_7_DAY',
          orderingDirection: 'ASC',
          suspense: false,
        })
      })
    })

    describe('when last 7 days is selected', () => {
      beforeEach(() => {
        setup({
          repoData: repoFlagsMock,
          useParamsValue: { historicalTrend: 'LAST_7_DAYS', search: '' },
        })
      })

      it('calls useRepoComponentsTable with correct query params', () => {
        renderHook(() => useRepoComponentsTable())

        const afterDate = format(subDays(new Date(), 7), 'yyyy-MM-dd')
        expect(useRepoFlags).toHaveBeenCalledWith({
          afterDate,
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '' },
          interval: 'INTERVAL_1_DAY',
          orderingDirection: 'ASC',
          suspense: false,
        })
      })
    })
  })

  describe('when there is a flags param', () => {
    it('calls useRepoComponentsTable with correct filters values', () => {
      setup({
        repoData: repoFlagsMock,
        useParamsValue: { flags: ['flag1'] },
      })

      renderHook(() => useRepoComponentsTable())

      expect(useRepoFlags).toHaveBeenCalledWith({
        afterDate: '2020-06-11',
        beforeDate: format(new Date(), 'yyyy-MM-dd'),
        filters: { flagsNames: ['flag1'] },
        interval: 'INTERVAL_30_DAY',
        orderingDirection: 'ASC',
        suspense: false,
      })
    })
  })
})
