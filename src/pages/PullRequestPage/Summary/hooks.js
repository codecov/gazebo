import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'

export function getPullDataForCompareSummary({
  head,
  base,
  compareWithBase,
  commits,
}) {
  let recentCommit = {}
  if (commits?.length) {
    const firstCommit = commits[0]?.node
    recentCommit = {
      recentCommit: firstCommit,
    }
  }

  return {
    headCoverage: head?.totals?.percentCovered,
    patchCoverage: compareWithBase?.patchTotals?.percentCovered * 100,
    changeCoverage: compareWithBase?.changeWithParent,
    headCommit: head?.commitid,
    baseCommit: base?.commitid,
    ...recentCommit,
  }
}

export function usePullForCompareSummary() {
  const { provider, owner, repo, pullId } = useParams()
  const { data: pull } = usePull({ provider, owner, repo, pullId })

  const head = pull?.head
  const base = pull?.comparedTo
  const compareWithBase = pull?.compareWithBase
  const commits = pull?.commits?.edges

  return useMemo(
    () =>
      getPullDataForCompareSummary({ head, base, compareWithBase, commits }),
    [head, base, compareWithBase, commits]
  )
}
