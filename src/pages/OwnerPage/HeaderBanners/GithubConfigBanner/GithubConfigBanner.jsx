import { useParams } from 'react-router-dom'

import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

const GithubConfigBanner = () => {
  const { provider } = useParams()
  const isGh = providerToName(provider) === 'Github'

  if (!isGh) return null

  return (
    <div>
      <Banner>
        <BannerHeading>
          <h2 className="flex justify-center gap-2 font-semibold">
            Configure{' '}
            <A
              data-testid="codecovGithubApp-link"
              to={{ pageName: 'codecovGithubAppSelectTarget' }}
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
