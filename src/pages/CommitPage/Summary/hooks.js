import isNumber from 'lodash/isNumber'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useCommit } from '../../../services/commit'

export function getCommitDataForSummary({ data }) {
  const rawPatch = data?.commit.compareWithParent?.patchTotals?.coverage
  const patchCoverage = isNumber(rawPatch) ? rawPatch * 100 : Number.NaN
  const headCoverage = data?.commit.totals?.coverage
  const parentCoverage = data?.commit.parent?.totals?.coverage

  return {
    headCoverage,
    patchCoverage,
    changeCoverage: headCoverage - parentCoverage,
    headCommitId: data?.commit.commitid,
    parentCommitId: data?.commit.parent?.commitid,
    state: data?.commit.state,
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

  return useMemo(() => getCommitDataForSummary({ data }), [data])
}
