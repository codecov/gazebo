import { lazy } from 'react'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'

const SentryTrialBanner = lazy(() => import('./SentryTrialBanner'))
const RequestInstallBanner = lazy(() => import('./RequestInstallBanner'))

const GlobalTopBanners: React.FC = () => {
  return (
    <SilentNetworkErrorWrapper>
      <RequestInstallBanner />
      <SentryTrialBanner />
    </SilentNetworkErrorWrapper>
  )
}

export default GlobalTopBanners
