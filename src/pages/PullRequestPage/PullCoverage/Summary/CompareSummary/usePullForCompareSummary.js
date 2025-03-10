import isNumber from 'lodash/isNumber'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull/usePull'
import { mapEdges } from 'shared/utils/graphql'

export function getPullDataForCompareSummary({
  head,
  base,
  compareWithBase,
  commits = [],
  behindBy,
  behindByCommit,
  defaultBranch,
}) {
  let optionalKeys = {}
  if (commits?.length > 0) {
    const firstCommit = commits.shift()
    optionalKeys = {
      recentCommit: firstCommit,
    }
  }

  const rawPatch = compareWithBase?.patchTotals?.percentCovered

  return {
    headCoverage: head?.coverageAnalytics?.totals?.percentCovered,
    patchCoverage: isNumber(rawPatch) ? rawPatch : Number.NaN,
    changeCoverage: compareWithBase?.changeCoverage,
    hasDifferentNumberOfHeadAndBaseReports:
      compareWithBase?.hasDifferentNumberOfHeadAndBaseReports,
    head,
    base,
    behindBy,
    behindByCommit,
    defaultBranch,
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
  const behindBy = data?.pull?.behindBy
  const behindByCommit = data?.pull?.behindByCommit
  const defaultBranch = data?.defaultBranch

  return useMemo(
    () =>
      getPullDataForCompareSummary({
        head,
        base,
        compareWithBase,
        commits,
        behindBy,
        behindByCommit,
        defaultBranch,
      }),
    [
      head,
      base,
      compareWithBase,
      commits,
      behindBy,
      behindByCommit,
      defaultBranch,
    ]
  )
}
