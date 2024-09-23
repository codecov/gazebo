import { lazy } from 'react'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'

const BundleFeedbackBanner = lazy(() => import('./BundleFeedbackBanner'))
const RequestInstallBanner = lazy(() => import('./RequestInstallBanner'))
const TrialBanner = lazy(() => import('./TrialBanner'))
const TeamPlanFeedbackBanner = lazy(() => import('./TeamPlanFeedbackBanner'))
const ProPlanFeedbackBanner = lazy(() => import('./ProPlanFeedbackBanner'))
const OktaBanners = lazy(() => import('./OktaBanners'))
const TokenlessBanner = lazy(() => import('./TokenlessBanner'))

const GlobalTopBanners: React.FC = () => {
  return (
    <SilentNetworkErrorWrapper>
      {/* These are listed in priority order: if multiple banners are rendering, only the bottommost will display. */}
      <div className="[&>*:last-child]:block">
        <OktaBanners />
        <RequestInstallBanner />
        <TrialBanner />
        <TeamPlanFeedbackBanner />
        <ProPlanFeedbackBanner />
        <BundleFeedbackBanner />
        <TokenlessBanner />
      </div>
    </SilentNetworkErrorWrapper>
  )
}

export default GlobalTopBanners
