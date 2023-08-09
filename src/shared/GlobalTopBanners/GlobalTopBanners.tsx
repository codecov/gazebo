import { lazy } from 'react'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'

const SentryTrialBanner = lazy(() => import('./SentryTrialBanner'))

const GlobalTopBanners: React.FC = () => {
  return (
    <SilentNetworkErrorWrapper>
      <SentryTrialBanner />
    </SilentNetworkErrorWrapper>
  )
}

export default GlobalTopBanners
