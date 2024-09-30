import isNumber from 'lodash/isNumber'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useCommit } from 'services/commit'

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
  const parentCoverage = parent?.coverageAnalytics?.totals?.coverage

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
  const { provider, owner, repo, commit: commitSha } = useParams()

  const { data } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSha,
  })

  const compareWithParent = data?.commit?.compareWithParent
  const totals = data?.commit?.coverageAnalytics?.totals
  const parent = data?.commit?.parent
  const state = data?.commit?.state
  const commitid = data?.commit?.commitid

  return useMemo(
    () =>
      getCommitDataForSummary({
        compareWithParent,
        totals,
        parent,
        state,
        commitid,
      }),
    [compareWithParent, totals, parent, state, commitid]
  )
}
