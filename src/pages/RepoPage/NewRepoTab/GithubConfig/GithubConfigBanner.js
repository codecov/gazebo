import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Banner from 'ui/Banner'

const GithubConfigBanner = ({ privateRepo }) => {
  const { provider } = useParams()
  const isGh = providerToName(provider) === 'Github'

  return isGh && privateRepo ? (
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
          <A
            data-testid="codecovGithubApp-link"
            to={{ pageName: 'codecovGithubApp' }}
          >
            Install Codecov&apos;s GitHub App
          </A>
          . Once installed, you are done! You do not need to set a{' '}
          <A data-testid="teamBot-link" to={{ pageName: 'teamBot' }}>
            Team Bot
          </A>
          because Codecov will use the integration to post statuses and
          comments.
        </p>
      </Banner>
    </div>
  ) : null
}

GithubConfigBanner.propTypes = {
  privateRepo: PropTypes.bool.isRequired,
}

export default GithubConfigBanner
