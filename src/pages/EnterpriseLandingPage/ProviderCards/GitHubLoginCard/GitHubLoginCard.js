import PropTypes from 'prop-types'

import { providerImage, providerToName } from 'shared/utils/provider'
import Button from 'ui/Button'

function GitHubLoginCard({ providers }) {
  const provider = 'gh'

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col w-64">
        <div className="flex flex-row gap-1 items-center justify-center pb-2 w-64">
          <img
            alt={`Logo of ${providerToName(provider)}`}
            className="mx-2 h-6 w-6"
            src={providerImage(provider)}
          />
          <h2 className="text-2xl">GitHub</h2>
        </div>
        <div className="flex flex-col gap-2">
          {providers.includes('GITHUB') && (
            <Button
              to={{ pageName: 'signIn', options: { provider: 'gh' } }}
              variant="github"
            >
              Login via GitHub
            </Button>
          )}
          {providers.includes('GITHUB_ENTERPRISE') && (
            <Button
              to={{ pageName: 'signIn', options: { provider: 'ghe' } }}
              variant="github"
            >
              Login via GitHub Enterprise
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

GitHubLoginCard.propTypes = {
  providers: PropTypes.array,
}

export default GitHubLoginCard
