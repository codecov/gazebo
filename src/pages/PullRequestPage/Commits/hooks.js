import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { usePullQuery } from 'generated'
import { mapEdges } from 'shared/utils/graphql'

export function getCompareCommitsData({ commits }) {
  return commits.map((commit) => ({
    message: commit?.message,
    commitid: commit?.commitid,
    author: commit?.author?.username,
  }))
}

export function useCompareCommits() {
  const { provider, owner, repo, pullId } = useParams()
  const { data, ...rest } = usePullQuery({
    provider,
    owner,
    repo,
    pullId: parseInt(pullId, 10),
  })

  const pull = data.owner?.repository?.pull

  // Can likely replace with react-query's select.
  const commits = useMemo(
    () => getCompareCommitsData({ commits: mapEdges(pull?.commits) }),
    [pull?.commits]
  )
  return { data: commits, ...rest }
}
