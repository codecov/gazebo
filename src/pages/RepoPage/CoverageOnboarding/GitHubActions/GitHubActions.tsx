import { useParams } from 'react-router-dom'

import { useOrgUploadToken } from 'services/orgUploadToken'
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

  const { provider, owner } = useParams<URLParams>()
  const { data: orgUploadToken } = useOrgUploadToken({ provider, owner })

  const showOrgToken = newRepoFlag && orgUploadToken

  return showOrgToken ? <GitHubActionsOrgToken /> : <GitHubActionsRepoToken />
}

export default GitHubActions
