import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { useParams } from 'react-router'

import { OktaConfigQueryOpts } from 'pages/AccountSettings/tabs/OktaAccess/queries/OktaConfigQueryOpts'

import OktaEnabledBanner from '../OktaEnabledBanner'
import OktaEnforcedBanner from '../OktaEnforcedBanner'
import OktaErrorBanners from '../OktaErrorBanners'

interface URLParams {
  provider: string
  owner?: string
}

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
