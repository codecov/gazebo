import { format, sub } from 'date-fns'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  AFTER_DATE_FORMAT_OPTIONS,
  MEASUREMENT_TIME_INTERVALS,
  TIME_OPTION_KEY,
} from 'pages/RepoPage/shared/constants'
import { useLocationParams } from 'services/navigation'
import { useRepo } from 'services/repo'
import { useRepoFlags } from 'services/repo/useRepoFlags'

const getSortByDirection = (isDesc: boolean) => (isDesc ? 'DESC' : 'ASC')

const createMeasurementVariables = (
  historicalTrend: TIME_OPTION_KEY,
  oldestCommitAt?: string | null
) => {
  const isAllTime = historicalTrend === 'ALL_TIME'
  const getOldestCommitAt = () =>
    oldestCommitAt
      ? new Date(oldestCommitAt)
      : sub(new Date(), { ...AFTER_DATE_FORMAT_OPTIONS.LAST_6_MONTHS })
  const selectedDate = isAllTime
    ? getOldestCommitAt()
    : sub(new Date(), { ...AFTER_DATE_FORMAT_OPTIONS[historicalTrend] })
  const afterDate = format(selectedDate, 'yyyy-MM-dd')
  const interval = isAllTime
    ? MEASUREMENT_TIME_INTERVALS.ALL_TIME
    : MEASUREMENT_TIME_INTERVALS[historicalTrend]

  return { afterDate, interval }
}

type URLParams = {
  provider: string
  owner: string
  repo: string
}

function useRepoFlagsTable(isDesc: boolean) {
  const { params } = useLocationParams({
    search: '',
    historicalTrend: 'LAST_3_MONTHS',
    flags: [],
  })
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
  })
  const isAdmin = repoData?.isAdmin
  // @ts-expect-errors, useLocation params needs to be updated to have full types
  const isSearching = Boolean(params?.search)
  const [sortBy, setSortBy] = useState<'ASC' | 'DESC'>(
    getSortByDirection(isDesc)
  )
  const { afterDate, interval } = createMeasurementVariables(
    // @ts-expect-errors, useLocation params needs to be updated to have full types
    params?.historicalTrend,
    repoData?.repository?.oldestCommitAt
  )

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRepoFlags({
      // @ts-expect-errors, useLocation params needs to be updated to have full types
      filters: { term: params?.search, flagsNames: params?.flags },
      orderingDirection: sortBy,
      beforeDate: format(new Date(), 'yyyy-MM-dd'),
      interval,
      afterDate,
      suspense: false,
    })

  const handleSort = useCallback(() => {
    const tableSortByDirection = getSortByDirection(isDesc)
    if (sortBy !== tableSortByDirection) {
      setSortBy(tableSortByDirection)
    }
  }, [isDesc, sortBy])

  return {
    data,
    isAdmin,
    isLoading,
    handleSort,
    isSearching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  }
}

export default useRepoFlagsTable
