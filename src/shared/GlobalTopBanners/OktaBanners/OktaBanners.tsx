import { lazy } from 'react'
import { useParams } from 'react-router'

import { useOktaConfig } from 'pages/AccountSettings/tabs/OktaAccess/hooks'
import { useFlags } from 'shared/featureFlags'

interface URLParams {
  provider: string
  owner?: string
}

const OktaEnabledBanner = lazy(() => import('../OktaEnabledBanner'))
const OktaEnforcedBanner = lazy(() => import('../OktaEnforcedBanner'))

function OktaBanners() {
  const { provider, owner } = useParams<URLParams>()
  const { oktaSettings } = useFlags({
    oktaSettings: false,
  })

  const { data } = useOktaConfig({
    provider,
    username: owner || '',
    opts: { enabled: !!owner },
  })

  const oktaConfig = data?.owner?.account?.oktaConfig

  if (
    !oktaSettings ||
    !owner ||
    !oktaConfig?.enabled ||
    data?.owner?.isUserOktaAuthenticated
  )
    return null

  return oktaConfig?.enforced ? <OktaEnforcedBanner /> : <OktaEnabledBanner />
}

export default OktaBanners
