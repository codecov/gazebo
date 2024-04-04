import { renderHook, waitFor } from '@testing-library/react'
import { format, sub, subDays, subMonths } from 'date-fns'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useRepo } from 'services/repo'
import { useRepoFlags } from 'services/repo/useRepoFlags'

import useRepoFlagsTable from './useRepoFlagsTable'

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

const mockedUseParams = useParams as jest.Mock
const mockedUseRepo = useRepo as jest.Mock
const mockedUseRepoFlags = useRepoFlags as jest.Mock
const mockedUseLocationParams = useLocationParams as jest.Mock

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

const defaultParams = {
  search: '',
  historicalTrend: 'LAST_3_MONTHS',
  flags: [],
}

interface SetupArgs {
  isEmptyRepoFlags?: boolean
  useParamsValue?: {
    search?: string
    historicalTrend?: string
    flags?: string[]
  }
}

describe('useRepoFlagsTable', () => {
  function setup({ isEmptyRepoFlags = false, useParamsValue = {} }: SetupArgs) {
    mockedUseParams.mockReturnValue({
      provider: 'gh',
      owner: 'codecov',
      repo: 'gazebo',
    })
    mockedUseRepo.mockReturnValue({
      data: {
        repository: { oldestCommitAt: '2020-06-11T18:28:52' },
      },
    })
    mockedUseLocationParams.mockReturnValue({
      params: { ...defaultParams, ...useParamsValue },
    })

    if (isEmptyRepoFlags) {
      mockedUseRepoFlags.mockReturnValue(emptyRepoFlagsMock)
    } else {
      mockedUseRepoFlags.mockReturnValue(repoFlagsMock)
    }
  }

  it('returns data accordingly', () => {
    setup({})

    const { result } = renderHook(() => useRepoFlagsTable(false))

    expect(result.current.data).toEqual(flagsData)
    expect(result.current.isLoading).toEqual(false)
    expect(result.current.hasNextPage).toEqual(true)
    expect(result.current.isFetchingNextPage).toEqual(false)
    expect(result.current.fetchNextPage).toEqual(fetchNextPage)
  })

  describe('when there is no data', () => {
    it('returns an empty array', () => {
      setup({ isEmptyRepoFlags: true })
      const { result } = renderHook(() => useRepoFlagsTable(false))

      expect(result.current.data).toEqual([])
    })
  })

  describe('when handleSort is triggered', () => {
    beforeEach(() => {
      setup({ isEmptyRepoFlags: true })
    })

    it('calls useRepoFlagsTable with desc value', async () => {
      const { result } = renderHook(() => useRepoFlagsTable(true))

      result.current.handleSort()

      await waitFor(() =>
        expect(useRepoFlags).toHaveBeenCalledWith({
          afterDate: format(sub(new Date(), { months: 3 }), 'yyyy-MM-dd'),
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '', flagsNames: [] },
          interval: 'INTERVAL_7_DAY',
          orderingDirection: 'DESC',
          suspense: false,
        })
      )
    })

    it('calls useRepoFlagsTable with asc value when the array is empty', async () => {
      const { result } = renderHook(() => useRepoFlagsTable(false))

      result.current.handleSort()

      await waitFor(() =>
        expect(useRepoFlags).toHaveBeenCalledWith({
          afterDate: format(sub(new Date(), { months: 3 }), 'yyyy-MM-dd'),
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '', flagsNames: [] },
          interval: 'INTERVAL_7_DAY',
          orderingDirection: 'ASC',
          suspense: false,
        })
      )
    })

    it('calls useRepoFlagsTable with asc value', async () => {
      const { result } = renderHook(() => useRepoFlagsTable(false))

      result.current.handleSort()

      await waitFor(() =>
        expect(useRepoFlags).toHaveBeenCalledWith({
          afterDate: format(sub(new Date(), { months: 3 }), 'yyyy-MM-dd'),
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '', flagsNames: [] },
          interval: 'INTERVAL_7_DAY',
          orderingDirection: 'ASC',
          suspense: false,
        })
      )
    })
  })

  describe('when there is search param', () => {
    it('calls useRepoFlagsTable with correct filters value', () => {
      setup({ useParamsValue: { search: 'flag1' } })

      const { result } = renderHook(() => useRepoFlagsTable(false))

      expect(result.current.isSearching).toEqual(true)
      expect(useRepoFlags).toHaveBeenCalledWith({
        afterDate: format(sub(new Date(), { months: 3 }), 'yyyy-MM-dd'),
        beforeDate: format(new Date(), 'yyyy-MM-dd'),
        filters: { term: 'flag1', flagsNames: [] },
        interval: 'INTERVAL_7_DAY',
        orderingDirection: 'ASC',
        suspense: false,
      })
    })
  })

  describe('historical trend', () => {
    describe('when historical trend param is empty', () => {
      beforeEach(() => {
        setup({})
      })

      it('calls useRepoFlagsTable with correct query params', () => {
        renderHook(() => useRepoFlagsTable(false))

        expect(useRepoFlags).toHaveBeenCalledWith({
          afterDate: format(sub(new Date(), { months: 3 }), 'yyyy-MM-dd'),
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '', flagsNames: [] },
          interval: 'INTERVAL_7_DAY',
          orderingDirection: 'ASC',
          suspense: false,
        })
      })
    })

    describe('when historical trend param is all time', () => {
      beforeEach(() => {
        setup({ useParamsValue: { historicalTrend: 'ALL_TIME' } })
      })

      it('calls useRepoFlagsTable with correct query params', () => {
        renderHook(() => useRepoFlagsTable(false))

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
          useParamsValue: { historicalTrend: 'LAST_6_MONTHS', search: '' },
        })
      })

      it('calls useRepoFlagsTable with correct query params', () => {
        renderHook(() => useRepoFlagsTable(false))

        const afterDate = format(subMonths(new Date(), 6), 'yyyy-MM-dd')
        expect(useRepoFlags).toHaveBeenCalledWith({
          afterDate,
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '', flagsNames: [] },
          interval: 'INTERVAL_7_DAY',
          orderingDirection: 'ASC',
          suspense: false,
        })
      })
    })

    describe('when last 7 days is selected', () => {
      beforeEach(() => {
        setup({
          useParamsValue: { historicalTrend: 'LAST_7_DAYS', search: '' },
        })
      })

      it('calls useRepoFlagsTable with correct query params', () => {
        renderHook(() => useRepoFlagsTable(false))

        const afterDate = format(subDays(new Date(), 7), 'yyyy-MM-dd')
        expect(useRepoFlags).toHaveBeenCalledWith({
          afterDate,
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '', flagsNames: [] },
          interval: 'INTERVAL_1_DAY',
          orderingDirection: 'ASC',
          suspense: false,
        })
      })
    })
  })

  describe('when there is a flags param', () => {
    it('calls useRepoFlagsTable with correct filters values', () => {
      setup({
        useParamsValue: { flags: ['flag1'] },
      })

      renderHook(() => useRepoFlagsTable(false))

      expect(useRepoFlags).toHaveBeenCalledWith({
        afterDate: format(sub(new Date(), { months: 3 }), 'yyyy-MM-dd'),
        beforeDate: format(new Date(), 'yyyy-MM-dd'),
        filters: { term: '', flagsNames: ['flag1'] },
        interval: 'INTERVAL_7_DAY',
        orderingDirection: 'ASC',
        suspense: false,
      })
    })
  })
})
