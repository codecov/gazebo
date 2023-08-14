import { lazy } from 'react'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'

const TrialBanner = lazy(() => import('./TrialBanner'))

const GlobalTopBanners: React.FC = () => {
  return (
    <SilentNetworkErrorWrapper>
      <TrialBanner />
    </SilentNetworkErrorWrapper>
  )
}

export default GlobalTopBanners
