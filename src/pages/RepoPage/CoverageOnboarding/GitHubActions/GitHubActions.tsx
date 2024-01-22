import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'
import { useFlags } from 'shared/featureFlags'

import GitHubActionsOrgToken from './GitHubActionsOrgToken'
import GitHubActionsRepoToken from './GitHubActionsRepoToken'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function GitHubActions() {
  const { newRepoFlag } = useFlags({
    newRepoFlag: false,
  })

  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useRepo({ provider, owner, repo })
  const showOrgToken = newRepoFlag && data?.orgUploadToken

  return showOrgToken ? <GitHubActionsOrgToken /> : <GitHubActionsRepoToken />
}

export default GitHubActions
