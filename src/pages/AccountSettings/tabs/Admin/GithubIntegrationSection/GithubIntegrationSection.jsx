import { useParams } from 'react-router-dom'

import config from 'config'

import { useAccountDetails } from 'services/account'
import A from 'ui/A'

function GithubIntegrationSection() {
  const { provider, owner } = useParams()
  const shouldRender = provider === 'gh' && !config.IS_SELF_HOSTED
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
    opts: {
      enabled: shouldRender,
    },
  })

  if (!shouldRender) return null

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Github Integration</h2>
      {accountDetails?.integrationId ? (
        <p>
          This account is configured via the GitHub App. You can manage the apps
          repository integration on <A to={{ pageName: 'github' }}>Github.</A>
        </p>
      ) : (
        <p>
          Integrate with Codecov through the GitHub App to strengthen
          Codecov&apos;s integration with your team.
          <br />
          This will replace the team bot account and post pull request comments
          on behalf of Codecov. <A to={{ pageName: 'githubMarketplace' }}></A>
        </p>
      )}
    </div>
  )
}

export default GithubIntegrationSection
