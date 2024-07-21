import { lazy } from 'react'
import { useParams } from 'react-router'

import { useOktaConfig } from 'pages/AccountSettings/tabs/OktaAccess/hooks'

interface URLParams {
  provider: string
  owner?: string
}

const OktaEnabledBanner = lazy(() => import('../OktaEnabledBanner'))
const OktaEnforcedBanner = lazy(() => import('../OktaEnforcedBanner'))

function OktaBanners() {
  const { provider, owner } = useParams<URLParams>()

  const { data } = useOktaConfig({
    provider,
    username: owner || '',
    opts: { enabled: !!owner },
  })

  const oktaConfig = data?.owner?.account?.oktaConfig

  if (!owner || !oktaConfig?.enabled || !data?.owner?.isUserOktaAuthenticated)
    return null

  return oktaConfig?.enforced ? <OktaEnforcedBanner /> : <OktaEnabledBanner />
}

export default OktaBanners
