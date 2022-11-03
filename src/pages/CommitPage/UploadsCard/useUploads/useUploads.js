import { useParams } from 'react-router-dom'

import { useCommit } from 'services/commit'

import { useExtractUploads } from '../useExtractUploads'

export function useUploads() {
  const { provider, owner, repo, commit } = useParams()
  const { data } = useCommit({
    provider,
    owner,
    repo,
    commitid: commit,
  })
  const { uploadsOverview, sortedUploads, uploadsProviderList, hasNoUploads } =
    useExtractUploads({ uploads: data?.commit?.uploads })

  return {
    uploadsOverview,
    sortedUploads,
    uploadsProviderList,
    hasNoUploads,
  }
}
