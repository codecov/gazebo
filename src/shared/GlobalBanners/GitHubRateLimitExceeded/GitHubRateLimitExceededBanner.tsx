import { useParams } from 'react-router-dom'

import { Provider } from 'shared/api/helpers'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import { Alert } from 'ui/Alert'

const GitHubRateLimitExceededBanner = () => {
  const { provider } = useParams<{ provider: Provider }>()
  const isGh = providerToName(provider) === 'Github'

  if (!isGh) return null

  return (
    <div className="mb-2">
      <Alert variant="warning">
        <Alert.Title>
          <h2 className="flex gap-2 font-semibold">Rate limit exceeded</h2>
        </Alert.Title>
        <Alert.Description>
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
        </Alert.Description>
      </Alert>
    </div>
  )
}

export default GitHubRateLimitExceededBanner
