import { useFlags } from 'shared/featureFlags'

import GitHubActionsOrgToken from './GitHubActionsOrgToken'
import GitHubActionsRepoToken from './GitHubActionsRepoToken'

function GitHubActions() {
  const { newRepoFlag: showOrgToken } = useFlags({
    newRepoFlag: false,
  })

  return showOrgToken ? <GitHubActionsOrgToken /> : <GitHubActionsRepoToken />
}

export default GitHubActions
