import { useParams } from 'react-router-dom'

import { useCommits } from 'services/commits'

import { usePullPageData } from '../../hooks/usePullPageData'

export const useTabsCounts = () => {
  const { owner, repo, pullId, provider } = useParams()
  const { data: pullPageData, isLoading: pullsLoading } = usePullPageData({
    provider,
    owner,
    repo,
    pullId,
  })

  const { data: commitsData, isLoading: commitsLoading } = useCommits({
    provider,
    owner,
    repo,
    filters: {
      pullId: +pullId,
    },
  })

  if (pullsLoading || commitsLoading) {
    return {
      flagsCount: 0,
      componentsCount: 0,
      directChangedFilesCount: 0,
      indirectChangesCount: 0,
      commitsCount: 0,
    }
  }

  const compareWithBase = pullPageData?.pull?.compareWithBase

  return {
    flagsCount: compareWithBase?.flagComparisonsCount,
    componentsCount: compareWithBase?.componentComparisonsCount,
    indirectChangesCount: compareWithBase?.indirectChangedFilesCount,
    directChangedFilesCount: compareWithBase?.directChangedFilesCount,
    commitsCount: commitsData?.pages[0]?.commitsCount,
  }
}
