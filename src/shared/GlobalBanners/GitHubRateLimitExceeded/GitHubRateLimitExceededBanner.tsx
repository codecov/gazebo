import { useParams } from 'react-router-dom'

import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import Banner from 'ui/Banner'
import BannerContent from 'ui/Banner/BannerContent'
import BannerHeading from 'ui/Banner/BannerHeading'

const GitHubRateLimitExceededBanner = () => {
  const { provider } = useParams<{ provider: string }>()
  const isGh = providerToName(provider) === 'Github'

  if (!isGh) return null

  return (
    <div className="mb-2">
      <Banner variant="warning">
        <BannerHeading>
          <h2 className="flex justify-center gap-2 font-semibold">
            Rate limit exceeded
          </h2>
        </BannerHeading>
        <BannerContent>
          <p className="flex items-center gap-2">
            Unable to calculate coverage due to GitHub rate limit exceeded.
            Please retry later. More info on rate limits:
            <A
              data-testid="codecovGithubApp-link"
              to={{ pageName: 'githubRateLimitExceeded' }}
              hook={undefined}
              isExternal={true}
            >
              Github documentation.
            </A>
          </p>
        </BannerContent>
      </Banner>
    </div>
  )
}

export default GitHubRateLimitExceededBanner
