import PropTypes from 'prop-types'

import Button from 'ui/Button'

function GitHubLoginCard({ github }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-64">
        <h2 className="text-2xl mb-2">GitHub</h2>
        <div className="flex flex-col gap-2">
          {github.map(({ hostingOption }, i) =>
            hostingOption === 'EXTERNAL' ? (
              <Button
                key={i}
                to={{ pageName: 'signIn', options: { provider: 'gh' } }}
                variant="github"
              >
                GitHub
              </Button>
            ) : (
              <Button
                key={i}
                to={{ pageName: 'signIn', options: { provider: 'ghe' } }}
                variant="github"
              >
                GitHub Enterprise
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

GitHubLoginCard.propTypes = {
  github: PropTypes.array,
}

export default GitHubLoginCard
