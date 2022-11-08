import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'
import { mapEdges } from 'shared/utils/graphql'

export function getPullDataForCompareSummary({
  head,
  base,
  compareWithBase,
  commits = [],
}) {
  let optionalKeys = {}
  if (commits?.length > 0) {
    const firstCommit = commits.shift()
    optionalKeys = {
      recentCommit: firstCommit,
    }
  }

  return {
    headCoverage: head?.totals?.percentCovered,
    patchCoverage: compareWithBase?.patchTotals?.percentCovered * 100,
    changeCoverage: compareWithBase?.changeWithParent,
    hasDifferentNumberOfHeadAndBaseReports:
      compareWithBase?.hasDifferentNumberOfHeadAndBaseReports,
    head,
    base,
    ...optionalKeys,
  }
}

export function usePullForCompareSummary() {
  const { provider, owner, repo, pullId } = useParams()
  const { data } = usePull({ provider, owner, repo, pullId })

  const head = data?.pull?.head
  const base = data?.pull?.comparedTo
  const compareWithBase = data?.pull?.compareWithBase
  const commits = mapEdges(data?.pull?.commits)

  return useMemo(
    () =>
      getPullDataForCompareSummary({ head, base, compareWithBase, commits }),
    [head, base, compareWithBase, commits]
  )
}
