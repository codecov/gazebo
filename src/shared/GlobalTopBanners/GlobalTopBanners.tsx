import { lazy } from 'react'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'

const RequestInstallBanner = lazy(() => import('./RequestInstallBanner'))
const TrialBanner = lazy(() => import('./TrialBanner'))
const AppInstallBanner = lazy(() => import('./AppInstallBanner'))

const GlobalTopBanners: React.FC = () => {
  return (
    <SilentNetworkErrorWrapper>
      <RequestInstallBanner />
      <TrialBanner />
      <AppInstallBanner />
    </SilentNetworkErrorWrapper>
  )
}

export default GlobalTopBanners
