import PropTypes from 'prop-types'
import config from 'config'

import { useAccountDetails } from 'services/account'
import Card from 'ui/Card'
import Button from 'ui/Button'

import githubLogo from './githublogo.png'

function GithubIntegrationCard({ provider, owner }) {
  const shouldRender = provider === 'gh' && !config.IS_ENTERPRISE
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
    opts: {
      enabled: shouldRender,
    },
  })

  if (!shouldRender) return null

  return (
    <Card className="p-10 text-color-900 w-1/2 mr-8">
      <div className="flex items-center">
        <img alt="Github" src={githubLogo} height={32} width={32} />
        <h2 className="text-2xl bold ml-4">Github - Integration</h2>
      </div>
      {accountDetails.integrationId ? (
        <div>
          <p className="mt-6 mb-8">
            This account is configured via the GitHub App. <br />
            You can manage the app on Github.
          </p>
          <Button
            Component="a"
            href="https://github.com/apps/codecov"
            variant="outline"
          >
            Continue to GitHub to manage repository integration
          </Button>
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
          <Button
            Component="a"
            href="https://github.com/marketplace/codecov"
            variant="outline"
          >
            Checkout Codecov in the GitHub Marketplace
          </Button>
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
