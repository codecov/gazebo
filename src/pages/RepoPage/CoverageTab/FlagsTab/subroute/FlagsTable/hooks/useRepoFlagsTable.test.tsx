import { renderHook, waitFor } from '@testing-library/react'
import { format, sub, subDays, subMonths } from 'date-fns'

import { TIME_OPTION_VALUES } from 'pages/RepoPage/shared/constants'

import useRepoFlagsTable from './useRepoFlagsTable'

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  useLocationParams: vi.fn(),
  useRepo: vi.fn(),
  useRepoFlags: vi.fn(),
}))

vi.mock('services/repo', async () => {
  const actual = await vi.importActual('services/repo')
  return {
    ...actual,
    useRepo: mocks.useRepo,
  }
})

vi.mock('services/repo/useRepoFlags', async () => {
  const actual = await vi.importActual('services/repo/useRepoFlags')
  return {
    ...actual,
    useRepoFlags: mocks.useRepoFlags,
  }
})

vi.mock('services/navigation/useLocationParams', async () => {
  const actual = await vi.importActual('services/navigation')
  return {
    ...actual,
    useLocationParams: mocks.useLocationParams,
  }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: mocks.useParams,
  }
})

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

const fetchNextPage = vi.fn()

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
  historicalTrend: TIME_OPTION_VALUES.LAST_3_MONTHS,
  flags: [],
}

interface SetupArgs {
  isEmptyRepoFlags?: boolean
  noOldestCommit?: boolean
  useParamsValue?: {
    search?: string
    historicalTrend?: string
    flags?: string[]
  }
}

describe('useRepoFlagsTable', () => {
  function setup({
    isEmptyRepoFlags = false,
    noOldestCommit = false,
    useParamsValue = {},
  }: SetupArgs) {
    mocks.useParams.mockReturnValue({
      provider: 'gh',
      owner: 'codecov',
      repo: 'gazebo',
    })
    mocks.useLocationParams.mockReturnValue({
      params: { ...defaultParams, ...useParamsValue },
    })

    if (noOldestCommit) {
      mocks.useRepo.mockReturnValue({
        data: {
          repository: { oldestCommitAt: null },
        },
      })
    } else {
      mocks.useRepo.mockReturnValue({
        data: {
          repository: { oldestCommitAt: '2020-06-11T18:28:52' },
        },
      })
    }

    if (isEmptyRepoFlags) {
      mocks.useRepoFlags.mockReturnValue(emptyRepoFlagsMock)
    } else {
      mocks.useRepoFlags.mockReturnValue(repoFlagsMock)
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

  describe('sorting', () => {
    beforeEach(() => {
      setup({ isEmptyRepoFlags: true })
    })

    it('calls useRepoFlagsTable with desc value', async () => {
      renderHook(() => useRepoFlagsTable(true))

      await waitFor(() =>
        expect(mocks.useRepoFlags).toHaveBeenCalledWith({
          afterDate: format(sub(new Date(), { months: 3 }), 'yyyy-MM-dd'),
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '', flagsNames: [] },
          interval: 'INTERVAL_7_DAY',
          orderingDirection: 'DESC',
          suspense: false,
        })
      )
    })

    it('calls useRepoFlagsTable with asc value', async () => {
      renderHook(() => useRepoFlagsTable(false))

      await waitFor(() =>
        expect(mocks.useRepoFlags).toHaveBeenCalledWith({
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
      expect(mocks.useRepoFlags).toHaveBeenCalledWith({
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
        setup({
          useParamsValue: {
            historicalTrend: '',
          },
        })
      })

      it('calls useRepoFlagsTable with correct query params', () => {
        renderHook(() => useRepoFlagsTable(false))

        expect(mocks.useRepoFlags).toHaveBeenCalledWith({
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

        expect(mocks.useRepoFlags).toHaveBeenCalledWith({
          afterDate: '2020-06-11',
          beforeDate: format(new Date(), 'yyyy-MM-dd'),
          filters: { term: '', flagsNames: [] },
          interval: 'INTERVAL_30_DAY',
          orderingDirection: 'ASC',
          suspense: false,
        })
      })
    })

    describe('when historical trend param is all time, but we do not have date of oldest commit', () => {
      beforeEach(() => {
        setup({
          noOldestCommit: true,
          useParamsValue: { historicalTrend: 'ALL_TIME' },
        })
      })

      it('calls useRepoFlagsTable with correct query params', () => {
        renderHook(() => useRepoFlagsTable(false))

        expect(mocks.useRepoFlags).toHaveBeenCalledWith({
          afterDate: format(sub(new Date(), { months: 6 }), 'yyyy-MM-dd'),
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
        expect(mocks.useRepoFlags).toHaveBeenCalledWith({
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
        expect(mocks.useRepoFlags).toHaveBeenCalledWith({
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

      expect(mocks.useRepoFlags).toHaveBeenCalledWith({
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
