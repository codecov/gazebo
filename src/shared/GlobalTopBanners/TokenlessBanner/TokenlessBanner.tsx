import React, { lazy } from 'react'
import { useParams } from 'react-router-dom'

import { ONBOARDING_SOURCE } from 'pages/TermsOfService/constants'
import { useLocationParams } from 'services/navigation'
import { useUploadTokenRequired } from 'services/uploadTokenRequired'
import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

const TokenRequiredBanner = lazy(() => import('./TokenRequiredBanner'))
const TokenNotRequiredBanner = lazy(() => import('./TokenNotRequiredBanner'))

type UseParams = {
  provider: string
  owner: string
}

const TokenlessBanner: React.FC = () => {
  const { tokenlessSection } = useFlags({
    tokenlessSection: false,
  })
  const { provider, owner } = useParams<UseParams>()
  const { data } = useUploadTokenRequired({ provider, owner, enabled: !!owner })
  const { data: currentUser } = useUser()
  const { params } = useLocationParams()
  // @ts-expect-error useLocationParams needs to be typed
  const cameFromOnboarding = params['source'] === ONBOARDING_SOURCE

  if (
    !tokenlessSection ||
    !owner ||
    !data ||
    !currentUser?.user ||
    cameFromOnboarding
  )
    return null

  return data?.uploadTokenRequired ? (
    <TokenRequiredBanner />
  ) : (
    <TokenNotRequiredBanner />
  )
}

export default TokenlessBanner
