import { useParams } from 'react-router-dom'

import { eventTracker } from 'services/events/events'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

const GithubConfigBanner = () => {
  const { provider } = useParams()
  const isGh = providerToName(provider) === 'GitHub'

  if (!isGh) return null

  return (
    <div className="mb-2">
      <Banner>
        <BannerHeading>
          <h2 className="flex justify-center gap-2 font-semibold">
            Configure{' '}
            <A
              data-testid="codecovGithubApp-link"
              to={{ pageName: 'codecovGithubAppSelectTarget' }}
              onClick={() =>
                eventTracker().track({
                  type: 'Button Clicked',
                  properties: {
                    buttonName: 'Install GitHub App',
                    buttonLocation: 'Configure GitHub app banner',
                  },
                })
              }
            >
              Codecov&apos;s GitHub app
            </A>
          </h2>
        </BannerHeading>
        <BannerContent>
          <p>
            Enable status posts, comments, improved rate limit handling, and
            private repo management.
          </p>
        </BannerContent>
      </Banner>
    </div>
  )
}

export default GithubConfigBanner
