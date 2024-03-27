import { lazy } from 'react'

import InstallationHelpBanner from 'layouts/BaseLayout/InstallationHelpBanner'
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
      <InstallationHelpBanner />
    </SilentNetworkErrorWrapper>
  )
}

export default GlobalTopBanners
