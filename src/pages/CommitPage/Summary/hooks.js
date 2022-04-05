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
  const patchCoverage = isNumber(rawPatch) ? rawPatch * 100 : Number.NaN
  const headCoverage = totals?.coverage
  const parentCoverage = parent?.totals?.coverage

  return {
    headCoverage,
    patchCoverage,
    changeCoverage: headCoverage - parentCoverage,
    headCommitId: commitid,
    parentCommitId: parent?.commitid,
    state: state,
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

  const { compareWithParent, totals, parent, state, commitid } = data?.commit

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
