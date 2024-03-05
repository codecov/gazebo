import { useParams } from 'react-router-dom'

import { useCommit } from 'services/commit'
import { useRepoOverview } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import { extractUploads } from 'shared/utils/extractUploads'

export function useUploads() {
  const { provider, owner, repo, commit } = useParams()
  const { data: overview } = useRepoOverview({ provider, owner, repo })
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })
  const { data: tierData } = useTier({ provider, owner })

  // TODO: We need backend functionality to properly manage access to carryforward flags for team tier members
  const isTeamPlan =
    multipleTiers && tierData === TierNames.TEAM && overview?.private

  const { data } = useCommit({
    provider,
    owner,
    repo,
    commitid: commit,
    isTeamPlan,
  })

  const { uploadsOverview, sortedUploads, uploadsProviderList, hasNoUploads } =
    extractUploads({ unfilteredUploads: data?.commit?.uploads })

  return {
    uploadsOverview,
    sortedUploads,
    uploadsProviderList,
    hasNoUploads,
  }
}
