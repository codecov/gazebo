import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'
import { mapEdges } from 'shared/utils/graphql'

export function getPullDataForCommitsList({ commits }) {
  return commits.map((commit) => ({
    headCoverage: commit?.totals?.coverage,
    patchCoverage: commit?.compareWithParent?.patchTotals?.coverage,
    changeCoverage: commit?.compareWithParent?.changeWithParent,
    message: commit?.message,
    commitid: commit?.commitid,
    author: commit?.author?.username,
  }))
}

export function usePullCommits() {
  const { provider, owner, repo, pullId } = useParams()
  const { data: pull, ...rest } = usePull({ provider, owner, repo, pullId })

  // Can likely replace with react-query's select.
  const commits = useMemo(
    () => getPullDataForCommitsList({ commits: mapEdges(pull?.commits) }),
    [pull?.commits]
  )
  return { data: commits, ...rest }
}
