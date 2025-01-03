import { useParams } from 'react-router-dom'

import { Provider } from 'shared/api/helpers'
import { providerToName } from 'shared/utils/provider'
import A from 'ui/A'
import { Alert } from 'ui/Alert'

interface URLParams {
  provider: Provider
}

const GitHubRateLimitExceededBanner = () => {
  const { provider } = useParams<URLParams>()
  const isGh = providerToName(provider) === 'GitHub'

  if (!isGh) return null

  return (
    <div className="mb-2">
      <Alert variant="warning">
        <Alert.Title>Rate limit exceeded</Alert.Title>
        <Alert.Description>
          Unable to calculate coverage due to GitHub rate limit exceeded. Please
          retry later. More info on rate limits:{' '}
          <A
            data-testid="codecovGithubApp-link"
            to={{ pageName: 'githubRateLimitExceeded' }}
            hook={undefined}
            isExternal={true}
          >
            Github documentation.
          </A>
        </Alert.Description>
      </Alert>
    </div>
  )
}

export default GitHubRateLimitExceededBanner
