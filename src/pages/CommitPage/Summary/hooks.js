import isNumber from 'lodash/isNumber'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useCommit } from '../../../services/commit'

export function getCommitDataForSummary({
  compareWithParent,
  totals,
  parent,
  state,
  commitid,
}) {
  const rawPatch = compareWithParent?.patchTotals?.coverage
  const patchCoverage = isNumber(rawPatch) ? rawPatch : Number.NaN
  const headCoverage = totals?.coverage
  const parentCoverage = parent?.totals?.coverage

  return {
    headCoverage,
    patchCoverage,
    changeCoverage: headCoverage - parentCoverage,
    headCommitId: commitid,
    parentCommitId: parent?.commitid,
    state,
  }
}

export function useCommitForSummary() {
  const { provider, owner, repo, commit: commitSHA } = useParams()
  const { data } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSHA,
  })

  return useMemo(
    () =>
      getCommitDataForSummary({
        compareWithParent: data?.commit?.compareWithParent,
        totals: data?.commit?.totals,
        parent: data?.commit?.parent,
        state: data?.commit?.state,
        commitid: data?.commit?.commitid,
      }),
    [
      data?.commit?.compareWithParent,
      data?.commit?.totals,
      data?.commit?.parent,
      data?.commit?.state,
      data?.commit?.commitid,
    ]
  )
}
