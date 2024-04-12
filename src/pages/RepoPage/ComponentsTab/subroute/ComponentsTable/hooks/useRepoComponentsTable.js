import { format, sub } from 'date-fns'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

import { SortingDirection } from 'old_ui/Table/constants'
import {
  AFTER_DATE_FORMAT_OPTIONS,
  MEASUREMENT_TIME_INTERVALS,
} from 'pages/RepoPage/shared/constants'
import { useLocationParams } from 'services/navigation'
import { useRepo, useRepoComponents } from 'services/repo'

const getSortByDirection = (isDesc) =>
  isDesc ? SortingDirection.DESC : SortingDirection.ASC

const createMeasurementVariables = (historicalTrend, oldestCommitAt) => {
  const isAllTime = !Boolean(historicalTrend) || historicalTrend === 'ALL_TIME'
  const selectedDate = isAllTime
    ? new Date(oldestCommitAt)
    : sub(new Date(), { ...AFTER_DATE_FORMAT_OPTIONS[historicalTrend] })
  const after = format(selectedDate, 'yyyy-MM-dd')
  const interval = isAllTime
    ? MEASUREMENT_TIME_INTERVALS.ALL_TIME
    : MEASUREMENT_TIME_INTERVALS[historicalTrend]

  return { after, interval }
}

function useRepoComponentsTable(isDesc) {
  const { params } = useLocationParams({
    search: '',
    historicalTrend: '',
    components: [],
  })
  const { provider, owner, repo } = useParams()
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
  })
  const isAdmin = repoData?.isAdmin
  const isSearching = Boolean(params?.components?.length)
  const [sortBy, setSortBy] = useState(SortingDirection.ASC)
  const { after, interval } = createMeasurementVariables(
    params?.historicalTrend,
    repoData?.repository?.oldestCommitAt
  )

  const { data, isLoading } = useRepoComponents({
    filters: { components: params?.components },
    orderingDirection: sortBy,
    before: format(new Date(), 'yyyy-MM-dd'),
    interval,
    after,
    branch: params?.branch,
    opts: { suspense: false },
  })

  const handleSort = useCallback(() => {
    const tableSortByDirection = getSortByDirection(isDesc)
    if (sortBy !== tableSortByDirection) {
      setSortBy(tableSortByDirection)
    }
  }, [isDesc, sortBy])

  return {
    data: data?.components || [],
    isAdmin,
    isLoading,
    handleSort,
    isSearching,
  }
}

export default useRepoComponentsTable
