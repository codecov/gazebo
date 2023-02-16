import PropTypes from 'prop-types'

import config from 'config'

import githubLogo from 'assets/githublogo.png'
import Card from 'old_ui/Card'
import { useAccountDetails } from 'services/account'
import A from 'ui/A'

function GithubIntegrationCard({ provider, owner }) {
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
    <Card className="p-10 md:mr-8 md:w-1/2">
      <div className="flex items-center">
        <img alt="Github" src={githubLogo} height={32} width={32} />
        <h2 className="bold ml-4 text-2xl">Github - Integration</h2>
      </div>
      {accountDetails.integrationId ? (
        <div>
          <p className="mt-6 mb-8">
            This account is configured via the GitHub App. <br />
            You can manage the app on Github.
          </p>
          <A to={{ pageName: 'github' }}></A>
        </div>
      ) : (
        <div>
          <p className="mt-6 mb-8">
            Integrate with Codecov through the GitHub App to strengthen
            Codecov’s integration with your team.
            <br />
            This will replace the team bot account and post pull request
            comments on behalf of Codecov.
          </p>
          <A to={{ pageName: 'githubMarketplace' }}></A>
        </div>
      )}
    </Card>
  )
}

GithubIntegrationCard.propTypes = {
  provider: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
}

export default GithubIntegrationCard
