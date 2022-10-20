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
  const uploads = data?.commit?.uploads?.sort(
    (a, b) => a.uploadType < b.uploadType
  )
  const { uploadsOverview, sortedUploads, uploadsProviderList, hasNoUploads } =
    useExtractUploads({ uploads })

  return {
    uploadsOverview,
    sortedUploads,
    uploadsProviderList,
    hasNoUploads,
  }
}
