import PropTypes from 'prop-types'

import Button from 'ui/Button'

function BitbucketLoginCard({ bitbucket }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-64">
        <h2 className="text-2xl mb-2">Bitbucket</h2>
        <div className="flex flex-col gap-2">
          {bitbucket.map(({ hostingOption }, i) =>
            hostingOption === 'EXTERNAL' ? (
              <Button
                key={i}
                to={{ pageName: 'signIn', options: { provider: 'bb' } }}
                variant="bitbucket"
              >
                Bitbucket
              </Button>
            ) : (
              <Button
                key={i}
                to={{ pageName: 'signIn', options: { provider: 'bbs' } }}
                variant="bitbucket"
              >
                Bitbucket Server
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  )
}

BitbucketLoginCard.propTypes = {
  bitbucket: PropTypes.array,
}

export default BitbucketLoginCard
