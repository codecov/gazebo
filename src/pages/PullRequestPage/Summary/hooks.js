import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'

export function getPullDataForCompareSummary({ head, base, compareWithBase }) {
  return {
    headCoverage: head?.totals?.coverage,
    patchCoverage: compareWithBase?.patchTotals?.coverage,
    changeCoverage: compareWithBase?.changeWithParent,
    headCommit: head?.commitid,
    baseCommit: base?.commitid,
  }
}

export function usePullForCompareSummary() {
  const { provider, owner, repo, pullid } = useParams()
  const { data: pull } = usePull({ provider, owner, repo, pullid })
  const head = pull?.head
  const base = pull?.comparedTo
  const compareWithBase = pull?.compareWithBase

  return useMemo(
    () => getPullDataForCompareSummary({ head, base, compareWithBase }),
    [head, base, compareWithBase]
  )
}
