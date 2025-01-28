import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { lazy } from 'react'
import { useParams } from 'react-router'

import { OktaConfigQueryOpts } from 'pages/AccountSettings/tabs/OktaAccess/queries/OktaConfigQueryOpts'

interface URLParams {
  provider: string
  owner?: string
}

const OktaEnabledBanner = lazy(() => import('../OktaEnabledBanner'))
const OktaEnforcedBanner = lazy(() => import('../OktaEnforcedBanner'))
const OktaErrorBanners = lazy(() => import('../OktaErrorBanners'))

function OktaBanners() {
  const { provider, owner } = useParams<URLParams>()

  const { data } = useSuspenseQueryV5(
    OktaConfigQueryOpts({
      provider,
      username: owner || '',
    })
  )

  const oktaConfig = data?.owner?.account?.oktaConfig

  if (!owner || !oktaConfig?.enabled || data?.owner?.isUserOktaAuthenticated) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      {oktaConfig?.enforced ? <OktaEnforcedBanner /> : <OktaEnabledBanner />}
      <OktaErrorBanners />
    </div>
  )
}

function OktaBannersWrapper() {
  const { owner } = useParams<URLParams>()
  if (!owner) {
    return null
  }

  return <OktaBanners />
}

export default OktaBannersWrapper
