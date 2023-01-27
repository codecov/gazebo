import isNumber from 'lodash/isNumber'
import { useMemo } from 'react'

import { useCommit } from '../../../../services/commit'

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

export function useCommitForSummary({
  provider,
  owner,
  repo,
  commit: commitSHA,
}) {
  const { data } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSHA,
  })

  const compareWithParent = data?.commit?.compareWithParent
  const totals = data?.commit?.totals
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
