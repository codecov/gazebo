import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import config from 'config'

import { useAccountDetails } from 'services/account'
import A from 'ui/A'

function GithubIntegrationCopy({ integrationId }) {
  if (integrationId)
    return (
      <p>
        This account is configured via the GitHub App. You can manage the apps
        repository integration on <A to={{ pageName: 'github' }}>GitHub.</A>
      </p>
    )
  return (
    <p>
      Integrate with Codecov through the GitHub App to strengthen Codecov&apos;s
      integration with your team.
      <br />
      This will replace the team bot account and post pull request comments on
      behalf of Codecov.{' '}
      <A to={{ pageName: 'codecovGithubAppSelectTarget' }}>
        View the Codecov App on GitHub
      </A>
    </p>
  )
}

GithubIntegrationCopy.propTypes = {
  integrationId: PropTypes.number,
}

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
      <h2 className="text-lg font-semibold">GitHub Integration</h2>
      <GithubIntegrationCopy integrationId={accountDetails?.integrationId} />
    </div>
  )
}

export default GithubIntegrationSection
