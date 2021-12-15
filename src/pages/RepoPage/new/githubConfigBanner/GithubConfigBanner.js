import Banner from 'ui/Banner'
import A from 'ui/A'
import PropTypes from 'prop-types'
import { useParams } from 'react-router'
import { providerToName } from 'shared/utils/provider'

const GithubConfigBanner = ({ privateRepo }) => {
  const { provider } = useParams()
  const isGh = providerToName(provider) === 'Github'
  const display = isGh && privateRepo

  return (
    display && (
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
            <A to={{ pageName: 'codecovGithuhApp' }}>
              Install Codecov&apos;s GitHub App
            </A>
            . Once installed, you are done! You do not need to set a{' '}
            <A to={{ pageName: 'teamBot' }}>Team Bot</A> because Codecov will
            use the integration to post statuses and comments.
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
