import React, { lazy } from 'react'
import { useParams } from 'react-router-dom'

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

  if (!tokenlessSection || !owner || !data || !currentUser?.user) return null

  return data?.uploadTokenRequired ? (
    <TokenRequiredBanner />
  ) : (
    <TokenNotRequiredBanner />
  )
}

export default TokenlessBanner
