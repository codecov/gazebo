import { useComparisonForCommitAndParent } from 'services/comparison/useComparisonForCommitAndParent'
import { transformImpactedFileData } from 'services/comparison/utils'

export function useCommitFileDiff({ provider, owner, repo, commitid, path }) {
  return useComparisonForCommitAndParent({
    provider,
    owner,
    repo,
    commitid,
    path,
    filters: { hasUnintendedChanges: true },
    opts: {
      select: (res) =>
        transformImpactedFileData(
          res?.data?.owner?.repository?.commit?.compareWithParent?.impactedFile
        ),
    },
  })
}
