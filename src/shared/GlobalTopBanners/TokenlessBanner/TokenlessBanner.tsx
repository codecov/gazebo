import { useParams } from 'react-router-dom'

import { ONBOARDING_SOURCE } from 'pages/TermsOfService/constants'
import { useLocationParams } from 'services/navigation/useLocationParams'
import { useUploadTokenRequired } from 'services/uploadTokenRequired'
import { useOwner, useUser } from 'services/user'
import { Provider } from 'shared/api/helpers'
import { useFlags } from 'shared/featureFlags'

import TokenNotRequiredBanner from './TokenNotRequiredBanner'
import TokenRequiredBanner from './TokenRequiredBanner'

type UseParams = {
  provider: Provider
  owner: string
}

const TokenlessBanner: React.FC = () => {
  const { tokenlessSection } = useFlags({
    tokenlessSection: false,
  })
  const { provider, owner } = useParams<UseParams>()
  const { data } = useUploadTokenRequired({ provider, owner, enabled: !!owner })
  const { data: ownerData } = useOwner({ username: owner })
  const { data: currentUser } = useUser()
  const { params } = useLocationParams()
  // @ts-expect-error useLocationParams needs to be typed
  const cameFromOnboarding = params['source'] === ONBOARDING_SOURCE
  const hasActiveRepos = ownerData?.hasActiveRepos
  const hasPublicRepos = ownerData?.hasPublicRepos

  if (
    !tokenlessSection ||
    !owner ||
    !data ||
    !currentUser?.user ||
    cameFromOnboarding ||
    !hasActiveRepos ||
    !hasPublicRepos
  ) {
    return null
  }

  return data?.uploadTokenRequired ? (
    <TokenRequiredBanner />
  ) : (
    <TokenNotRequiredBanner />
  )
}

export default TokenlessBanner
