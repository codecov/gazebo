import PropTypes from 'prop-types'

import { providerImage, providerToName } from 'shared/utils/provider'
import Button from 'ui/Button'

function BitbucketLoginCard({ providers }) {
  const provider = 'bb'

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col w-64">
        <div className="flex flex-row gap-1 items-center justify-center pb-2 w-64">
          <img
            alt={`Logo of ${providerToName(provider)}`}
            className="mx-2 h-6 w-6"
            src={providerImage(provider)}
          />
          <h2 className="text-2xl">Bitbucket</h2>
        </div>
        <div className="flex flex-col gap-2">
          {providers.includes('BITBUCKET') && (
            <Button
              to={{ pageName: 'signIn', options: { provider: 'bb' } }}
              variant="bitbucket"
            >
              Login via Bitbucket
            </Button>
          )}
          {providers.includes('BITBUCKET_SERVER') && (
            <Button
              to={{ pageName: 'signIn', options: { provider: 'bbs' } }}
              variant="bitbucket"
            >
              Login via Bitbucket Server
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

BitbucketLoginCard.propTypes = {
  providers: PropTypes.array,
}

export default BitbucketLoginCard
