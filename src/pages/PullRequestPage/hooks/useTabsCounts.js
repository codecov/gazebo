import { useParams } from 'react-router-dom'

import { useCommits } from 'services/commits'

import { usePullPageData } from './usePullPageData'

export const useTabsCounts = () => {
  const { owner, repo, pullId, provider } = useParams()
  const { data } = usePullPageData({
    provider,
    owner,
    repo,
    pullId,
  })

  const { data: commitsData } = useCommits({
    provider,
    owner,
    repo,
    filters: {
      pullId: +pullId,
    },
    opts: { suspense: false },
  })

  const compareWithBase = data?.pull?.compareWithBase

  const flagsCount = compareWithBase?.flagComparisonsCount || 0
  const indirectChangesCount = compareWithBase?.indirectChangedFilesCount || 0
  const impactedFilesCount = compareWithBase?.impactedFilesCount || 0
  const commitsCount = commitsData?.commitsCount || 0

  return { flagsCount, impactedFilesCount, indirectChangesCount, commitsCount }
}
