import { useParams } from 'react-router-dom'

import { useCommit } from 'services/commit'
import { useRepoOverview } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { extractUploads } from 'shared/utils/extractUploads'

import { UploadFilters } from '../UploadsCard'

interface URLParams {
  provider: string
  owner: string
  repo: string
  commit: string
}

interface UseUploadsArgs {
  filters?: UploadFilters
}

export function useUploads({ filters }: UseUploadsArgs) {
  const { provider, owner, repo, commit } = useParams<URLParams>()
  const { data: overview } = useRepoOverview({ provider, owner, repo })
  const { data: tierData } = useTier({ provider, owner })

  // TODO: We need backend functionality to properly manage access to carryforward flags for team tier members
  const isTeamPlan = tierData === TierNames.TEAM && overview?.private

  const { data } = useCommit({
    provider,
    owner,
    repo,
    commitid: commit,
    isTeamPlan,
  })

  const {
    uploadsOverview,
    groupedUploads,
    uploadsProviderList,
    hasNoUploads,
    erroredUploads,
    flagErrorUploads,
    searchResults,
  } = extractUploads({ unfilteredUploads: data?.commit?.uploads, filters })

  return {
    uploadsOverview,
    groupedUploads,
    uploadsProviderList,
    hasNoUploads,
    erroredUploads,
    flagErrorUploads,
    searchResults,
  }
}
