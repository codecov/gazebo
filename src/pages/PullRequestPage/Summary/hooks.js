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
    headCommit: head?.commitid,
    baseCommit: base?.commitid,
    ...optionalKeys,
  }
}

export function usePullForCompareSummary() {
  const { provider, owner, repo, pullId } = useParams()
  const { data: pull } = usePull({ provider, owner, repo, pullId })

  const head = pull?.head
  const base = pull?.comparedTo
  const compareWithBase = pull?.compareWithBase
  const commits = mapEdges(pull?.commits)

  return useMemo(
    () =>
      getPullDataForCompareSummary({ head, base, compareWithBase, commits }),
    [head, base, compareWithBase, commits]
  )
}
