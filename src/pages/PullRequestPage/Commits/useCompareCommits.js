import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'
import { mapEdges } from 'shared/utils/graphql'

export function getCompareCommitsData({ commits }) {
  return commits.map((commit) => ({
    message: commit?.message,
    commitid: commit?.commitid,
    author: commit?.author?.username,
    state: commit?.state,
  }))
}

export function useCompareCommits() {
  const { provider, owner, repo, pullId } = useParams()
  const { data: pull, ...rest } = usePull({ provider, owner, repo, pullId })

  // Can likely replace with react-query's select.
  const commits = useMemo(
    () => getCompareCommitsData({ commits: mapEdges(pull?.commits) }),
    [pull?.commits]
  )
  return { data: commits, ...rest }
}
