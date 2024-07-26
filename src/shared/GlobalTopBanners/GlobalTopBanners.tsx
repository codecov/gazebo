import { lazy } from 'react'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'

const RequestInstallBanner = lazy(() => import('./RequestInstallBanner'))
const TrialBanner = lazy(() => import('./TrialBanner'))
const TeamPlanFeedbackBanner = lazy(() => import('./TeamPlanFeedbackBanner'))
const OktaBanners = lazy(() => import('./OktaBanners'))

const GlobalTopBanners: React.FC = () => {
  return (
    <SilentNetworkErrorWrapper>
      <OktaBanners />
      <RequestInstallBanner />
      <TrialBanner />
      <TeamPlanFeedbackBanner />
    </SilentNetworkErrorWrapper>
  )
}

export default GlobalTopBanners
