import PropTypes from 'prop-types'

import { providerImage, providerToName } from 'shared/utils/provider'
import Button from 'ui/Button'

function GitLabLoginCard({ gitlab }) {
  const provider = 'gl'

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col w-64">
        <div className="flex flex-row gap-1 items-center justify-center pb-2 w-64">
          <img
            alt={`Logo of ${providerToName(provider)}`}
            className="mx-2 h-6 w-6"
            src={providerImage(provider)}
          />
          <h2 className="text-2xl">GitLab</h2>
        </div>
        <div className="flex flex-col gap-2 w-64">
          {gitlab.map(({ hostingOption }, i) =>
            hostingOption === 'EXTERNAL' ? (
              <Button
                key={i}
                to={{ pageName: 'signIn', options: { provider: 'gl' } }}
                variant="gitlab"
              >
                GitLab
              </Button>
            ) : (
              <Button
                key={i}
                to={{ pageName: 'signIn', options: { provider: 'gle' } }}
                variant="gitlab"
              >
                GitLab CE/EE
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

GitLabLoginCard.propTypes = {
  gitlab: PropTypes.array,
}

export default GitLabLoginCard
