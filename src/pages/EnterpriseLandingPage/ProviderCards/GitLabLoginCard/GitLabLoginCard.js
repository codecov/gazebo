import PropTypes from 'prop-types'

import Button from 'ui/Button'

function GitLabLoginCard({ gitlab }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-64">
        <h2 className="text-2xl mb-2">GitLab</h2>
        <div className="flex flex-col gap-2">
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
