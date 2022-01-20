import Banner from 'ui/Banner'
import Icon from 'ui/Icon'
import PropTypes from 'prop-types'
import { useParams } from 'react-router'
import { providerToName } from 'shared/utils/provider'

const GithubConfigBanner = ({ privateRepo }) => {
  const { provider } = useParams()
  const isGh = providerToName(provider) === 'Github'

  return (
    isGh &&
    privateRepo && (
      <div className="mt-8">
        <Banner
          title={
            <div className="flex justify-center gap-2">
              <h2>Install Codecov GitHub app</h2>
            </div>
          }
        >
          <p>
            The best way to integrate with Codecov.io is to{' '}
            <a
              data-testid="codecovGithuhApp-link"
              rel="noreferrer"
              target="_blank"
              href="https://github.com/apps/codecov"
              className="text-ds-blue"
            >
              Install Codecov&apos;s GitHub App
            </a>
            <span className="inline-block text-gray-500">
              <Icon name="external-link" size="sm" />
            </span>
            . Once installed, you are done! You do not need to set a{' '}
            <a
              data-testid="teamBot-link"
              rel="noreferrer"
              target="_blank"
              href="https://docs.codecov.com/docs/team-bot"
              className="text-ds-blue"
            >
              Team Bot
            </a>
            <span className="inline-block text-gray-500">
              <Icon name="external-link" size="sm" />
            </span>{' '}
            because Codecov will use the integration to post statuses and
            comments.
          </p>
        </Banner>
      </div>
    )
  )
}

GithubConfigBanner.propTypes = {
  privateRepo: PropTypes.bool.isRequired,
}

export default GithubConfigBanner
