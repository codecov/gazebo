import { lazy } from 'react'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'

const RequestInstallBanner = lazy(() => import('./RequestInstallBanner'))
const TrialBanner = lazy(() => import('./TrialBanner'))
const TeamPlanFeedbackBanner = lazy(() => import('./TeamPlanFeedbackBanner'))

const GlobalTopBanners: React.FC = () => {
  return (
    <SilentNetworkErrorWrapper>
      <RequestInstallBanner />
      <TrialBanner />
      <TeamPlanFeedbackBanner />
    </SilentNetworkErrorWrapper>
  )
}
export default GlobalTopBanners
