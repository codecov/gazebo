import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import React from 'react'
import { useParams } from 'react-router-dom'

import { ONBOARDING_SOURCE } from 'pages/TermsOfService/constants'
import { useLocationParams } from 'services/navigation/useLocationParams'
import { useUploadTokenRequired } from 'services/uploadTokenRequired'
import { useUser } from 'services/user'
import { TokenlessQueryOpts } from 'services/user/TokenlessQueryOpts'
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
  const { data: ownerTokenlessData } = useSuspenseQueryV5(
    TokenlessQueryOpts({ username: owner, provider })
  )
  const { data: currentUser } = useUser()
  const { params } = useLocationParams()
  // @ts-expect-error useLocationParams needs to be typed
  const cameFromOnboarding = params['source'] === ONBOARDING_SOURCE
  // showing the tokenless banner when the owner does not have any
  // active repos nor any public repos does not give the user any value and
  // potentially causes confusion
  const hasActiveRepos = ownerTokenlessData?.hasActiveRepos
  const hasPublicRepos = ownerTokenlessData?.hasPublicRepos
  const relevantToCurrentOwner = hasActiveRepos && hasPublicRepos

  if (
    !tokenlessSection ||
    !owner ||
    !data ||
    !currentUser?.user ||
    cameFromOnboarding ||
    !relevantToCurrentOwner
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
